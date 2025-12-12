"""
Rule-based Chatbot Logic - Không cần API key
"""
import re
from datetime import datetime, timedelta
from core.database import db

def get_user_appointments(user_id, role):
    """Lấy danh sách appointments của user trong 7 ngày tới"""
    appointments = db.get('appointments', {})
    user_appointments = []
    
    # Lấy ngày hiện tại (bỏ giờ phút giây)
    today = datetime.now().date()
    week_later = today + timedelta(days=7)
    
    print(f"[Chatbot Debug] Checking appointments for user_id={user_id}, role={role}")
    print(f"[Chatbot Debug] Date range: {today} to {week_later}")
    
    for appt_id, appt in appointments.items():
        try:
            # Parse start_time thay vì date
            start_time_str = appt.get('start_time', '')
            if not start_time_str:
                continue
            
            # Parse datetime rồi lấy date
            appt_datetime = datetime.strptime(start_time_str, '%Y-%m-%d %H:%M:%S')
            appt_date = appt_datetime.date()
            
            print(f"[Chatbot Debug] Checking appointment {appt_id}: date={appt_date}, name={appt.get('name')}")
            
            # Chỉ lấy appointments từ hôm nay đến 7 ngày sau
            if appt_date < today or appt_date > week_later:
                print(f"  -> Skipped: date out of range")
                continue
            
            # Filter theo role
            if role == 'STUDENT':
                # Sinh viên: chỉ lấy appointments đã đăng ký
                current_slots = appt.get('current_slots', [])
                print(f"  -> current_slots: {current_slots}")
                if user_id not in current_slots:
                    print(f"  -> Skipped: user not in current_slots")
                    continue
            elif role == 'TUTOR':
                # Tutor: lấy appointments của mình tạo (kiểm tra tutor_id)
                tutor_id = appt.get('tutor_id')
                print(f"  -> tutor_id: {tutor_id}")
                if tutor_id != user_id:
                    print(f"  -> Skipped: not created by user")
                    continue
            else:
                continue
            
            print(f"  -> ADDED to list!")
            user_appointments.append({
                'id': appt_id,
                'name': appt.get('name', 'Buổi tư vấn'),
                'date': appt_date.strftime('%Y-%m-%d'),
                'start_time': appt.get('start_time', 'N/A'),
                'end_time': appt.get('end_time', 'N/A'),
                'place': appt.get('place', 'Chưa rõ'),
                'current_slots': appt.get('current_slots', []),
                'max_slots': appt.get('max_slots', 0)
            })
        except Exception as e:
            print(f"Error parsing appointment {appt_id}: {e}")
            import traceback
            traceback.print_exc()
            continue
    
    print(f"[Chatbot Debug] Total appointments found: {len(user_appointments)}")
    
    # Sắp xếp theo ngày
    user_appointments.sort(key=lambda x: x['date'])
    return user_appointments

def detect_intent(message):
    """Nhận diện ý định từ tin nhắn (rule-based)"""
    message = message.lower().strip()
    
    # Pattern 1: Hỏi về lịch sắp tới / quên gì
    if re.search(r'(quên|lịch|nhắc|sắp tới|hôm nay|tuần này|ngày mai)', message):
        return 'show_schedule'
    
    # Pattern 2: Hỏi chào
    if re.search(r'(xin chào|hello|hi|chào)', message):
        return 'greeting'
    
    # Pattern 3: Cảm ơn
    if re.search(r'(cảm ơn|thank|thanks|cám ơn)', message):
        return 'thanks'
    
    # Pattern 4: Giúp đỡ
    if re.search(r'(giúp|help|hướng dẫn)', message):
        return 'help'
    
    # Default: không hiểu
    return 'unknown'

def generate_response(intent, user_name, role, appointments):
    """Tạo câu trả lời dựa trên intent và data"""
    
    if intent == 'greeting':
        return f"Xin chào {user_name}! 😊\n\nTôi là trợ lý ảo của BKTutor. Bạn có thể hỏi tôi về lịch học/tư vấn sắp tới của bạn."
    
    elif intent == 'thanks':
        return "Không có gì! Rất vui được giúp bạn. 😊"
    
    elif intent == 'help':
        if role == 'STUDENT':
            return """📚 **Tôi có thể giúp bạn:**
            
• Xem lịch tư vấn sắp tới
• Nhắc nhở buổi học/tư vấn
• Kiểm tra đăng ký

💬 **Thử hỏi:**
- "Tôi có quên gì không?"
- "Lịch tuần này"
- "Lịch hôm nay"
"""
        else:  # TUTOR
            return """👨‍🏫 **Tôi có thể giúp bạn:**
            
• Xem các session đã mở
• Kiểm tra số lượng đăng ký
• Nhắc nhở buổi tư vấn sắp tới

💬 **Thử hỏi:**
- "Tôi có quên gì không?"
- "Lịch tuần này"
- "Có ai đăng ký chưa?"
"""
    
    elif intent == 'show_schedule':
        if not appointments:
            if role == 'STUDENT':
                return f"Bạn không có lịch tư vấn nào trong 7 ngày tới. 📅\n\nHãy đặt lịch với tutor nhé!"
            else:  # TUTOR
                return f"Bạn chưa mở session tư vấn nào trong 7 ngày tới. 📅\n\nHãy tạo session mới để sinh viên đăng ký!"
        
        # Có appointments - format response
        response = f"📅 **Lịch của {user_name} (7 ngày tới):**\n\n"
        
        for idx, appt in enumerate(appointments, 1):
            response += f"**{idx}. {appt['name']}**\n"
            response += f"   📆 Ngày: {appt['date']}\n"
            response += f"   🕒 Giờ: {appt['start_time']} - {appt['end_time']}\n"
            response += f"   📍 Địa điểm: {appt['place']}\n"
            
            if role == 'TUTOR':
                registered = len(appt.get('current_slots', []))
                max_slots = appt.get('max_slots', 0)
                response += f"   👥 Đã đăng ký: {registered}/{max_slots} sinh viên\n"
            
            response += "\n"
        
        return response
    
    else:  # unknown
        return f"Xin lỗi, tôi chưa hiểu câu hỏi của bạn. 😅\n\nHãy thử hỏi:\n• 'Tôi có quên gì không?'\n• 'Lịch tuần này'\n• 'Giúp tôi'"

def chat_with_bot(user_id, role, user_name, user_message):
    """
    Xử lý tin nhắn từ user - Rule-based (không cần API)
    """
    try:
        # Lấy appointments
        appointments = get_user_appointments(user_id, role)
        
        # Nhận diện intent
        intent = detect_intent(user_message)
        
        # Tạo response
        response = generate_response(intent, user_name, role, appointments)
        
        return {
            'success': True,
            'message': response,
            'appointments_count': len(appointments)
        }
        
    except Exception as e:
        print(f"Error in chat_with_bot: {e}")
        import traceback
        traceback.print_exc()
        return {
            'success': False,
            'message': 'Xin lỗi, tôi gặp lỗi. Vui lòng thử lại sau.',
            'appointments_count': 0
        }
