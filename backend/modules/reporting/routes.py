from flask import Blueprint, jsonify, request
from .logic import get_summary_report, list_reports, save_allocation, get_participation_results
from core.database import db

bp = Blueprint('reporting', __name__, url_prefix='/reporting')


@bp.route('/summary', methods=['GET'])
def summary():
    return jsonify({'ok': True, 'summary': get_summary_report()}), 200


@bp.route('/list', methods=['GET'])
def reports_list():
    return jsonify({'ok': True, 'reports': list_reports()}), 200


@bp.route('/allocate', methods=['POST'])
def allocate():
    payload = request.get_json() or {}
    saved = save_allocation(payload)
    return jsonify({'ok': True, 'allocation': saved}), 201


@bp.route('/participation', methods=['GET'])
def participation():
    return jsonify({'ok': True, 'results': get_participation_results()}), 200
