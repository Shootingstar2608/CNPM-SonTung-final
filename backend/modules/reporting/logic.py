from typing import List, Dict
from core.database import db
from datetime import datetime


def get_summary_report() -> Dict:
    # Return a simple summary derived from in-memory db
    total_users = len(db.get('users', {}))
    total_docs = len(db.get('documents', {}))
    total_appointments = len(db.get('appointments', {}))
    return {
        'generated_at': datetime.now().isoformat(),
        'total_users': total_users,
        'total_documents': total_docs,
        'total_appointments': total_appointments,
        'notes': 'Mock summary report for officer/dept/university_officer'
    }


def list_reports() -> List[Dict]:
    # Return a mocked list of reports
    reports = [
        {'id': 'r1', 'title': 'Báo cáo tổng quan buổi học', 'created_at': '2025-11-26', 'owner': 'Phòng Đào Tạo'},
        {'id': 'r2', 'title': 'Báo cáo phân bổ nguồn lực', 'created_at': '2025-11-25', 'owner': 'Khoa/CNPM'},
    ]
    return reports


def save_allocation(payload: Dict) -> Dict:
    # store allocation in db under key 'allocations'
    allocs = db.setdefault('allocations', {})
    alloc_id = f"alloc_{len(allocs)+1}"
    allocs[alloc_id] = {
        'id': alloc_id,
        'payload': payload,
        'created_at': datetime.now().isoformat()
    }
    return allocs[alloc_id]


def get_participation_results() -> List[Dict]:
    # mocked participation results
    return [
        {'student': 'Nguyễn Văn A', 'session': 'Luyện thi', 'score': 8.5},
        {'student': 'Trần Thị B', 'session': 'Hướng dẫn đồ án', 'score': 9.0},
    ]
