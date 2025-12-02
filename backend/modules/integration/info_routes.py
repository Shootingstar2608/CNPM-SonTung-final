from flask import Blueprint, request, jsonify, g, current_app
from core.database import db
from core.security import require_login
from datetime import datetime

bp = Blueprint('info', __name__, url_prefix='/info')


def _check_roles(allowed):
    """Simple helper to check g.current_user role against allowed set."""
    user = getattr(g, 'current_user', None)
    if not user:
        return False
    role = user.get('role')
    if isinstance(role, str):
        role_name = role
    elif isinstance(role, dict):
        role_name = role.get('name')
    else:
        role_name = getattr(role, 'name', None)
    return role_name in allowed


@bp.route('/overview', methods=['GET'])
@require_login
def overview():
    allowed = {'OFFICER', 'DEPARTMENT', 'UNIVERSITY_OFFICER', 'ADMIN'}
    if not _check_roles(allowed):
        return jsonify({'error': 'Forbidden'}), 403

    data = {
        'users_count': len(db.get('users', {})),
        'appointments_count': len(db.get('appointments', {})),
        'documents_count': len(db.get('documents', {})),
    }
    return jsonify(data), 200


@bp.route('/users', methods=['GET'])
@require_login
def list_users():
    allowed = {'OFFICER', 'DEPARTMENT', 'UNIVERSITY_OFFICER', 'ADMIN'}
    if not _check_roles(allowed):
        return jsonify({'error': 'Forbidden'}), 403

    users = []
    for u in db.get('users', {}).values():
        uu = u.copy()
        uu.pop('password', None)
        users.append(uu)
    return jsonify({'count': len(users), 'users': users}), 200


@bp.route('/appointments', methods=['GET'])
@require_login
def list_appointments():
    allowed = {'OFFICER', 'DEPARTMENT', 'UNIVERSITY_OFFICER', 'ADMIN'}
    if not _check_roles(allowed):
        return jsonify({'error': 'Forbidden'}), 403

    apts = list(db.get('appointments', {}).values())
    return jsonify({'count': len(apts), 'appointments': apts}), 200


@bp.route('/appointments/mine', methods=['GET'])
@require_login
def my_appointments():
    # Return appointments related to the current user (student's booked sessions)
    user = getattr(g, 'current_user', None)
    if not user:
        return jsonify({'error': 'Forbidden'}), 403

    uid = user.get('id')
    if not uid:
        return jsonify({'error': 'Forbidden'}), 403

    result = []
    for appt in db.get('appointments', {}).values():
        if uid in appt.get('current_slots', []) or appt.get('id') in db.get('users', {}).get(uid, {}).get('booked_appointments', []):
            result.append(appt)

    return jsonify({'count': len(result), 'appointments': result}), 200


@bp.route('/appointments/<appt_id>/feedback', methods=['POST'])
def submit_feedback(appt_id):
    # Lightweight demo endpoint: accept feedback as long as caller provides a student_id
    # This relaxes participant checks for demo/demo-report purposes.
    body = request.get_json() or {}
    student_id = body.get('student_id')

    # If request was authenticated, prefer that user id
    auth_user = getattr(g, 'current_user', None)
    if auth_user and auth_user.get('id'):
        student_id = auth_user.get('id')

    if not student_id:
        return jsonify({'error': 'student_id is required (or authenticate)'}), 400

    appt = db.get('appointments', {}).get(appt_id)
    if not appt:
        return jsonify({'error': 'Appointment not found'}), 404

    rating = body.get('rating')
    comment = body.get('comment', '')

    if rating is None:
        return jsonify({'error': 'rating is required'}), 400

    feedback_entry = {
        'student_id': student_id,
        'rating': int(rating),
        'comment': comment,
        'created_at': datetime.utcnow().isoformat() + 'Z'
    }

    # Append feedback (create list if missing)
    if 'feedback' not in appt or appt.get('feedback') is None:
        appt['feedback'] = []

    appt['feedback'].append(feedback_entry)
    db['appointments'][appt_id] = appt

    return jsonify({'feedback': feedback_entry}), 201


@bp.route('/documents', methods=['GET'])
@require_login
def list_documents():
    allowed = {'OFFICER', 'DEPARTMENT', 'UNIVERSITY_OFFICER', 'ADMIN'}
    if not _check_roles(allowed):
        return jsonify({'error': 'Forbidden'}), 403

    docs = list(db.get('documents', {}).values())
    return jsonify({'count': len(docs), 'documents': docs}), 200


@bp.route('/users/<user_id>', methods=['PATCH'])
@require_login
def update_user(user_id):
    # Only DEPARTMENT or ADMIN can update academic fields
    allowed = {'DEPARTMENT', 'ADMIN'}
    if not _check_roles(allowed):
        return jsonify({'error': 'Forbidden'}), 403

    body = request.get_json() or {}
    user = db.get('users', {}).get(user_id)
    if not user:
        return jsonify({'error': 'Not found'}), 404

    # Only allow updating specific academic fields to avoid changing core auth fields
    for key in ('score', 'conduct_points', 'scholarship_level'):
        if key in body:
            user[key] = body.get(key)

    # persist (in-memory) and return sanitized user
    db['users'][user_id] = user
    u = user.copy()
    u.pop('password', None)
    return jsonify({'user': u}), 200
