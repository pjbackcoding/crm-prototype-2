from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all domains on all routes

# Configure SQLite database
basedir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(basedir, 'crm.db')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + db_path
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Candidate model - all fields are nullable to allow incomplete data
class Candidate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=True)
    first_name = db.Column(db.String(100), nullable=True)
    phone = db.Column(db.String(50), nullable=True)
    email = db.Column(db.String(100), nullable=True)
    skills = db.Column(db.Text, nullable=True)
    experience = db.Column(db.Text, nullable=True)
    education = db.Column(db.Text, nullable=True)
    function = db.Column(db.String(100), nullable=True)
    sector = db.Column(db.String(100), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name or '',
            'first_name': self.first_name or '',
            'phone': self.phone or '',
            'email': self.email or '',
            'skills': self.skills or '',
            'experience': self.experience or '',
            'education': self.education or '',
            'function': self.function or '',
            'sector': self.sector or '',
            'notes': self.notes or '',
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

# Création des tables au démarrage
with app.app_context():
    db.create_all()

# Routes for candidates
@app.route('/api/candidates', methods=['GET'])
def get_candidates():
    search_term = request.args.get('search', '').lower()
    function = request.args.get('function', '')
    sector = request.args.get('sector', '')
    
    query = Candidate.query
    
    # Apply search filters
    if search_term:
        query = query.filter(
            db.or_(
                Candidate.name.ilike(f'%{search_term}%'),
                Candidate.first_name.ilike(f'%{search_term}%'),
                Candidate.email.ilike(f'%{search_term}%'),
                Candidate.skills.ilike(f'%{search_term}%'),
                Candidate.experience.ilike(f'%{search_term}%')
            )
        )
    
    if function:
        query = query.filter(Candidate.function.ilike(f'%{function}%'))
    
    if sector:
        query = query.filter(Candidate.sector.ilike(f'%{sector}%'))
    
    candidates = query.order_by(Candidate.updated_at.desc()).all()
    return jsonify([c.to_dict() for c in candidates])

@app.route('/api/candidates/<int:candidate_id>', methods=['GET'])
def get_candidate(candidate_id):
    candidate = Candidate.query.get(candidate_id)
    if not candidate:
        return jsonify({'error': 'Candidate not found'}), 404
    return jsonify(candidate.to_dict())

@app.route('/api/candidates', methods=['POST'])
def create_candidate():
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
        
    # Create candidate with received data - all fields are optional
    candidate = Candidate(
        name=data.get('name'),
        first_name=data.get('first_name'),
        phone=data.get('phone'),
        email=data.get('email'),
        skills=data.get('skills'),
        experience=data.get('experience'),
        education=data.get('education'),
        function=data.get('function'),
        sector=data.get('sector'),
        notes=data.get('notes')
    )
    
    db.session.add(candidate)
    db.session.commit()
    
    return jsonify(candidate.to_dict()), 201

@app.route('/api/candidates/<int:candidate_id>', methods=['PUT'])
def update_candidate(candidate_id):
    candidate = Candidate.query.get(candidate_id)
    if not candidate:
        return jsonify({'error': 'Candidate not found'}), 404
        
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
        
    # Update fields if present in data
    for field in ['name', 'first_name', 'phone', 'email', 'skills', 
                 'experience', 'education', 'function', 'sector', 'notes']:
        if field in data:
            setattr(candidate, field, data[field])
    
    candidate.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify(candidate.to_dict())

@app.route('/api/candidates/<int:candidate_id>', methods=['DELETE'])
def delete_candidate(candidate_id):
    candidate = Candidate.query.get(candidate_id)
    if not candidate:
        return jsonify({'error': 'Candidate not found'}), 404
        
    db.session.delete(candidate)
    db.session.commit()
    
    return '', 204

# Serve frontend
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if path and os.path.exists(os.path.join('../frontend', path)):
        return send_from_directory('../frontend', path)
    return send_from_directory('../frontend', 'index.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
