import os
import requests
from flask import jsonify, request, g
from google import genai
from app.extensions import db
from app.models.ai_chat import TeamAIChat
from app.models.team import Team, TeamMember, TeamMessage 
from app.models.task import Task
from app.models.user import User

# 1. LOAD API KEY
API_KEY = os.getenv("GEMINI_API_KEY")

def chat_with_project_manager(team_id):
    if not API_KEY:
        return jsonify({'error': 'Server configuration error: AI Key missing'}), 500

    data = request.get_json()
    user_message = data.get('message')
    current_user = User.query.get(g.user_id) # Get who is asking
    
    # --- 1. DATA FETCHING ---
    member = TeamMember.query.filter_by(team_id=team_id, user_id=g.user_id).first()
    if not member: return jsonify({'error': 'Unauthorized'}), 403
    
    team = Team.query.get(team_id)

    # Fetch Data
    team_members = TeamMember.query.filter_by(team_id=team_id).all()
    members_list = [m.user.full_name.split(" ")[0] for m in team_members] # Just first names
    members_data = ", ".join(members_list)

    tasks = Task.query.filter_by(team_id=team_id).all()
    # Format tasks more naturally for the AI
    tasks_data = ""
    for t in tasks:
        assignee = t.assigned_to.full_name.split(" ")[0] if t.assigned_to else "No one"
        tasks_data += f"[{t.title}] is {t.status} (Assigned to: {assignee}, Priority: {t.priority})\n"

    # Chat Context
    recent_chats = TeamMessage.query.filter_by(team_id=team_id).order_by(TeamMessage.timestamp.desc()).limit(10).all()
    chat_data = "\n".join([f"{msg.sender.full_name.split(' ')[0]}: {msg.content}" for msg in reversed(recent_chats)])

    # Commits
    commits_data = "No recent commits."
    if team.github_repo:
        try:
            repo_path = team.github_repo.replace("https://github.com/", "").replace(".git", "")
            gh_res = requests.get(f"https://api.github.com/repos/{repo_path}/commits?per_page=3", timeout=2)
            if gh_res.status_code == 200:
                commits = gh_res.json()
                commits_data = "\n".join([f"- {c['commit']['message']} (by {c['commit']['author']['name']})" for c in commits])
        except:
            pass

    # --- 2. THE "COOL TEAMMATE" PERSONA ---
    system_instruction = f"""
    You are the AI teammate for "{team.name}". You are chatting with **{current_user.full_name}**.

    📊 **THE DOWNLOAD (Live Data):**
    - Squad: {members_data}
    - Work:
    {tasks_data if tasks_data else "Nothing on the board."}
    - Recent Chatter:
    {chat_data if chat_data else "Silence."}
    - Git:
    {commits_data}

    🔥 **YOUR VIBE (Strict Rules):**
    1. **NO ROBOT TALK:** Never say "Hello, I am the AI..." or "How can I assist?". It's cringe.
    2. **Be Casual:** Talk like a dev on Discord/Slack. Use slang like "shipped", "buggy", "WIP", "LGTM".
    3. **No Bullet Point Dumps:** Do NOT spit out a list of tasks unless specifically asked to "list all tasks". Summarize naturally.
    4. **Be Witty:** If things are good, use a celebration emoji 🎉. If deadlines are missed, use a sweaty face 😅.
    5. **Direct Answers:** If asked "What is Sumit doing?", just say "Sumit is working on the AI Implementation task. Looks important."

    📝 **EXAMPLE CONVERSATION:**
    - User: "What's up?"
    - You: "Not much, just watching Sumit crush that high-priority AI task. 🚀 The UI task is still pending though."
    
    - User: "Any updates?"
    - You: "Yeah, we got 3 active tasks. Soham is handling the testing, but I haven't seen a commit from him in a while. 👀"

    - User: "Who is in the team?"
    - You: "It's just you, me, Sumit, and Soham running the show."

    Current User: {current_user.full_name}
    User Message: "{user_message}"
    """

    # Fetch History
    history_records = TeamAIChat.query.filter_by(team_id=team_id, user_id=g.user_id)\
        .order_by(TeamAIChat.timestamp.desc()).limit(6).all()
    
    # Construct Prompt
    full_prompt = system_instruction + "\n\n--- PAST CHAT ---\n"
    for msg in reversed(history_records):
        role = "AI" if msg.is_bot else "User"
        full_prompt += f"{role}: {msg.content}\n"
    
    full_prompt += f"User: {user_message}\nAI:"

    # --- 3. CALL GEMINI ---
    try:
        client = genai.Client(api_key=API_KEY)
        response = client.models.generate_content(
            model="gemini-flash-latest", 
            contents=full_prompt
        )
        ai_reply = response.text
    except Exception as e:
        print(f"Gemini Error: {e}")
        return jsonify({'error': 'AI Brain Freeze 🥶', 'details': str(e)}), 500

    # --- 4. SAVE & RETURN ---
    try:
        db.session.add(TeamAIChat(team_id=team_id, user_id=g.user_id, content=user_message, is_bot=False))
        db.session.add(TeamAIChat(team_id=team_id, user_id=g.user_id, content=ai_reply, is_bot=True))
        db.session.commit()
    except:
        db.session.rollback()

    return jsonify({'reply': ai_reply}), 200

# Keep get_chat_history same as before...
def get_chat_history(team_id):
    history = TeamAIChat.query.filter_by(team_id=team_id, user_id=g.user_id)\
        .order_by(TeamAIChat.timestamp.asc()).all()
    return jsonify([{'content': m.content, 'is_bot': m.is_bot} for m in history]), 200