"""
Chatbot Routes - Rule-based chatbot
"""
from flask import Blueprint, request, jsonify, g
from core.security import require_login
from .logic import chat_with_bot

chatbot_bp = Blueprint('chatbot', __name__, url_prefix='/chat')

@chatbot_bp.route('/message', methods=['POST'])
@require_login
def send_message():
    """
    Endpoint nhận tin nhắn từ user và trả lời
    
    Request body:
    {
        "message": "tôi có quên gì không?"
    }
    
    Response:
    {
        "reply": "Bạn có 2 buổi học sắp tới...",
        "success": true
    }
    """
    try:
        current_user = g.current_user
        data = request.get_json()
        user_message = data.get('message', '').strip()
        
        if not user_message:
            return jsonify({
                'success': False,
                'reply': 'Vui lòng nhập tin nhắn'
            }), 400
        
        # Xử lý với rule-based bot
        result = chat_with_bot(
            user_id=current_user['id'],
            role=current_user['role'],
            user_name=current_user['name'],
            user_message=user_message
        )
        
        return jsonify({
            'success': result['success'],
            'reply': result['message'],
            'appointments_count': result.get('appointments_count', 0)
        })
        
    except Exception as e:
        print(f"Error in send_message: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'reply': f'Đã xảy ra lỗi: {str(e)}'
        }), 500

@chatbot_bp.route('/health', methods=['GET'])
def health_check():
    """Check if chatbot service is running"""
    return jsonify({
        'status': 'ok',
        'service': 'chatbot',
        'type': 'rule-based'
    })
