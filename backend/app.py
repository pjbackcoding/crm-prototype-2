from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os
import json
from datetime import datetime, timedelta
from sqlalchemy import desc, or_, and_, func
from werkzeug.utils import secure_filename
import uuid

app = Flask(__name__)
CORS(app)  # Enable CORS for all domains on all routes

# Configure SQLite database
basedir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(basedir, 'crm_new.db')  # Utilisation d'un nouveau nom de fichier
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + db_path
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Association table for tags and candidates
candidate_tags = db.Table('candidate_tags',
    db.Column('candidate_id', db.Integer, db.ForeignKey('candidate.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tag.id'), primary_key=True)
)

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
    status = db.Column(db.String(50), default='Nouveau', nullable=True)  # e.g. Nouveau, Contacté, Entretien, Rejecté, Placé
    salary_expectation = db.Column(db.String(50), nullable=True)
    availability = db.Column(db.String(100), nullable=True)  # e.g. Immediate, 1 mois, 3 mois
    cv_file = db.Column(db.String(255), nullable=True)  # Path to stored CV file
    profile_picture = db.Column(db.String(255), nullable=True)  # Path to profile picture
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    tags = db.relationship('Tag', secondary=candidate_tags, lazy='subquery',
        backref=db.backref('candidates', lazy=True))
    interactions = db.relationship('Interaction', backref='candidate', lazy=True, cascade="all, delete-orphan")
    
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
            'status': self.status or 'Nouveau',
            'salary_expectation': self.salary_expectation or '',
            'availability': self.availability or '',
            'cv_file': self.cv_file or '',
            'profile_picture': self.profile_picture or '',
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'tags': [tag.to_dict() for tag in self.tags],
            'interactions': [interaction.to_dict() for interaction in self.interactions]
        }

# Tag model for categorizing candidates
class Tag(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False, unique=True)
    color = db.Column(db.String(20), default='#4a6fa5')  # Hex color code
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'color': self.color,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

# Interaction model for tracking communication with candidates
class Interaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    candidate_id = db.Column(db.Integer, db.ForeignKey('candidate.id'), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # e.g. Email, Phone, Interview, Note
    date = db.Column(db.DateTime, default=datetime.utcnow)
    content = db.Column(db.Text, nullable=True)
    outcome = db.Column(db.String(100), nullable=True)  # e.g. Positive, Negative, Follow-up needed
    next_step = db.Column(db.String(100), nullable=True)
    next_step_date = db.Column(db.DateTime, nullable=True)
    created_by = db.Column(db.String(100), nullable=True)  # User who created this interaction
    
    def to_dict(self):
        return {
            'id': self.id,
            'candidate_id': self.candidate_id,
            'type': self.type,
            'date': self.date.isoformat() if self.date else None,
            'content': self.content or '',
            'outcome': self.outcome or '',
            'next_step': self.next_step or '',
            'next_step_date': self.next_step_date.isoformat() if self.next_step_date else None,
            'created_by': self.created_by or ''
        }

# Création des tables au démarrage
with app.app_context():
    db.create_all()

# Création d'un dossier pour les uploads
UPLOAD_FOLDER = os.path.join(basedir, 'uploads')
os.makedirs(os.path.join(UPLOAD_FOLDER, 'cvs'), exist_ok=True)
os.makedirs(os.path.join(UPLOAD_FOLDER, 'profile_pictures'), exist_ok=True)

# Routes for candidates
@app.route('/api/candidates', methods=['GET'])
def get_candidates():
    search_term = request.args.get('search', '').lower()
    function = request.args.get('function', '')
    sector = request.args.get('sector', '')
    status = request.args.get('status', '')
    tag_id = request.args.get('tag_id')
    availability = request.args.get('availability', '')
    sort_by = request.args.get('sort_by', 'updated_at')
    sort_order = request.args.get('sort_order', 'desc')
    
    query = Candidate.query
    
    # Apply search filters
    if search_term:
        query = query.filter(
            db.or_(
                Candidate.name.ilike(f'%{search_term}%'),
                Candidate.first_name.ilike(f'%{search_term}%'),
                Candidate.email.ilike(f'%{search_term}%'),
                Candidate.skills.ilike(f'%{search_term}%'),
                Candidate.experience.ilike(f'%{search_term}%'),
                Candidate.notes.ilike(f'%{search_term}%')
            )
        )
    
    if function:
        query = query.filter(Candidate.function.ilike(f'%{function}%'))
    
    if sector:
        query = query.filter(Candidate.sector.ilike(f'%{sector}%'))
    
    if status:
        query = query.filter(Candidate.status == status)
        
    if availability:
        query = query.filter(Candidate.availability.ilike(f'%{availability}%'))
    
    if tag_id:
        tag = Tag.query.get(tag_id)
        if tag:
            query = query.filter(Candidate.tags.contains(tag))
    
    # Apply sorting
    if hasattr(Candidate, sort_by):
        sort_attr = getattr(Candidate, sort_by)
        if sort_order == 'desc':
            query = query.order_by(desc(sort_attr))
        else:
            query = query.order_by(sort_attr)
    else:
        query = query.order_by(Candidate.updated_at.desc())
    
    candidates = query.all()
    return jsonify([c.to_dict() for c in candidates])

@app.route('/api/candidates/<int:candidate_id>', methods=['GET'])
def get_candidate(candidate_id):
    candidate = Candidate.query.get(candidate_id)
    if not candidate:
        return jsonify({'error': 'Candidate not found'}), 404
    return jsonify(candidate.to_dict())

@app.route('/api/candidates', methods=['POST'])
def create_candidate():
    print('=' * 50)
    print('RECEIVED POST TO /candidates')
    
    # Log headers to see content type and other info
    print('\nHeaders:')
    for key, value in request.headers.items():
        print(f'{key}: {value}')
    
    # Try to inspect raw data
    print('\nRaw request data:', request.data)
    
    # Log the request JSON
    data = request.json
    print('\nRequest JSON data:', data)
    
    if not data:
        print('ERROR: No JSON data provided')
        return jsonify({'error': 'No data provided'}), 400
        
    try:
        # Create candidate with received data - all fields are optional
        candidate = Candidate(
            name=data.get('name', ''),
            first_name=data.get('first_name', ''),
            phone=data.get('phone'),
            email=data.get('email'),
            skills=data.get('skills'),
            experience=data.get('experience'),
            education=data.get('education'),
            function=data.get('function'),
            sector=data.get('sector'),
            notes=data.get('notes'),
            status=data.get('status', 'Nouveau'),
            salary_expectation=data.get('salary_expectation'),
            availability=data.get('availability')
        )
        
        print('\nCandidate object created with attributes:')
        print(f'name: {candidate.name}')
        print(f'first_name: {candidate.first_name}')
        print(f'email: {candidate.email}')
        print(f'phone: {candidate.phone}')
        print(f'function: {candidate.function}')
        print(f'sector: {candidate.sector}')
        print(f'experience: {candidate.experience}')
        print(f'notes: {candidate.notes}')
        
        # Add tags if provided
        if 'tag_ids' in data:
            print('\nProcessing tags:')
            for tag_id in data['tag_ids']:
                print(f'Looking for tag ID: {tag_id}')
                tag = Tag.query.get(tag_id)
                if tag:
                    print(f'Found tag: {tag.name}')
                    candidate.tags.append(tag)
                else:
                    print(f'Tag with ID {tag_id} not found')
        
        # Add and commit to DB
        db.session.add(candidate)
        db.session.commit()
        
        # Get the response to return
        response_data = candidate.to_dict()
        print('\nResponding with:', response_data)
        print('=' * 50)
        
        return jsonify(response_data), 201
        
    except Exception as e:
        print(f'\nEXCEPTION: {str(e)}')
        print('=' * 50)
        db.session.rollback()
        return jsonify({'error': f'Error creating candidate: {str(e)}'}), 500

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
                 'experience', 'education', 'function', 'sector', 'notes',
                 'status', 'salary_expectation', 'availability']:
        if field in data:
            setattr(candidate, field, data[field])
    
    # Handle tags
    if 'tag_ids' in data:
        # First clear existing tags
        candidate.tags = []
        
        # Then add the specified tags
        for tag_id in data['tag_ids']:
            tag = Tag.query.get(tag_id)
            if tag:
                candidate.tags.append(tag)
    
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

# Routes for tags
@app.route('/api/tags', methods=['GET'])
def get_tags():
    tags = Tag.query.all()
    return jsonify([tag.to_dict() for tag in tags])

@app.route('/api/tags', methods=['POST'])
def create_tag():
    data = request.json
    if not data or 'name' not in data:
        return jsonify({'error': 'Tag name is required'}), 400
    
    # Check if tag already exists
    existing_tag = Tag.query.filter_by(name=data['name']).first()
    if existing_tag:
        return jsonify({'error': 'Tag already exists'}), 409
    
    tag = Tag(
        name=data['name'],
        color=data.get('color', '#4a6fa5')
    )
    
    db.session.add(tag)
    db.session.commit()
    
    return jsonify(tag.to_dict()), 201

@app.route('/api/tags/<int:tag_id>', methods=['PUT'])
def update_tag(tag_id):
    tag = Tag.query.get(tag_id)
    if not tag:
        return jsonify({'error': 'Tag not found'}), 404
    
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    if 'name' in data:
        tag.name = data['name']
    if 'color' in data:
        tag.color = data['color']
    
    db.session.commit()
    
    return jsonify(tag.to_dict())

@app.route('/api/tags/<int:tag_id>', methods=['DELETE'])
def delete_tag(tag_id):
    tag = Tag.query.get(tag_id)
    if not tag:
        return jsonify({'error': 'Tag not found'}), 404
    
    db.session.delete(tag)
    db.session.commit()
    
    return '', 204

# Routes for interactions
@app.route('/api/candidates/<int:candidate_id>/interactions', methods=['GET'])
def get_interactions(candidate_id):
    candidate = Candidate.query.get(candidate_id)
    if not candidate:
        return jsonify({'error': 'Candidate not found'}), 404
    
    interactions = Interaction.query.filter_by(candidate_id=candidate_id).order_by(Interaction.date.desc()).all()
    return jsonify([interaction.to_dict() for interaction in interactions])

@app.route('/api/candidates/<int:candidate_id>/interactions', methods=['POST'])
def create_interaction(candidate_id):
    candidate = Candidate.query.get(candidate_id)
    if not candidate:
        return jsonify({'error': 'Candidate not found'}), 404
    
    data = request.json
    if not data or 'type' not in data:
        return jsonify({'error': 'Interaction type is required'}), 400
    
    # Convert string date to datetime if provided
    next_step_date = None
    if data.get('next_step_date'):
        try:
            next_step_date = datetime.fromisoformat(data['next_step_date'].replace('Z', '+00:00'))
        except ValueError:
            pass
    
    interaction = Interaction(
        candidate_id=candidate_id,
        type=data['type'],
        content=data.get('content'),
        outcome=data.get('outcome'),
        next_step=data.get('next_step'),
        next_step_date=next_step_date,
        created_by=data.get('created_by')
    )
    
    # Update candidate status if provided
    if data.get('update_status'):
        candidate.status = data['update_status']
    
    db.session.add(interaction)
    db.session.commit()
    
    return jsonify(interaction.to_dict()), 201

@app.route('/api/interactions/<int:interaction_id>', methods=['DELETE'])
def delete_interaction(interaction_id):
    interaction = Interaction.query.get(interaction_id)
    if not interaction:
        return jsonify({'error': 'Interaction not found'}), 404
    
    db.session.delete(interaction)
    db.session.commit()
    
    return '', 204

# Route for uploading files
@app.route('/api/candidates/<int:candidate_id>/upload', methods=['POST'])
def upload_file(candidate_id):
    candidate = Candidate.query.get(candidate_id)
    if not candidate:
        return jsonify({'error': 'Candidate not found'}), 404
    
    # Check if the post request has the file part
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    file_type = request.form.get('type', 'cv')  # cv or profile_picture
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    # Generate a secure filename with uuid to avoid collisions
    filename = secure_filename(file.filename)
    unique_filename = f"{uuid.uuid4()}_{filename}"
    
    # Determine the upload folder based on file type
    if file_type == 'cv':
        upload_path = os.path.join(UPLOAD_FOLDER, 'cvs', unique_filename)
        candidate.cv_file = unique_filename
    else:  # profile_picture
        upload_path = os.path.join(UPLOAD_FOLDER, 'profile_pictures', unique_filename)
        candidate.profile_picture = unique_filename
    
    # Save the file
    file.save(upload_path)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'filename': unique_filename,
        'candidate': candidate.to_dict()
    })

# Route to serve uploaded files
@app.route('/api/uploads/<file_type>/<filename>')
def get_uploaded_file(file_type, filename):
    if file_type not in ['cvs', 'profile_pictures']:
        return jsonify({'error': 'Invalid file type'}), 400
    
    return send_from_directory(os.path.join(UPLOAD_FOLDER, file_type), filename)

# Dashboard statistics
@app.route('/api/stats', methods=['GET'])
def get_stats():
    total_candidates = Candidate.query.count()
    
    # Candidates by status
    status_stats = db.session.query(
        Candidate.status, func.count(Candidate.id)
    ).group_by(Candidate.status).all()
    
    # Candidates by function
    function_stats = db.session.query(
        Candidate.function, func.count(Candidate.id)
    ).filter(Candidate.function != None, Candidate.function != '')\
    .group_by(Candidate.function).all()
    
    # Candidates by sector
    sector_stats = db.session.query(
        Candidate.sector, func.count(Candidate.id)
    ).filter(Candidate.sector != None, Candidate.sector != '')\
    .group_by(Candidate.sector).all()
    
    # Candidates created in the last 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_candidates_count = Candidate.query.filter(Candidate.created_at >= thirty_days_ago).count()
    
    # Candidates updated in the last 7 days
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    updated_candidates_count = Candidate.query.filter(Candidate.updated_at >= seven_days_ago).count()
    
    # Upcoming interactions
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    upcoming_interactions = Interaction.query.filter(
        Interaction.next_step_date >= today
    ).order_by(Interaction.next_step_date).all()
    
    return jsonify({
        'total_candidates': total_candidates,
        'status_stats': [{'status': status or 'Non défini', 'count': count} for status, count in status_stats],
        'function_stats': [{'function': function, 'count': count} for function, count in function_stats],
        'sector_stats': [{'sector': sector, 'count': count} for sector, count in sector_stats],
        'recent_candidates_count': recent_candidates_count,
        'updated_candidates_count': updated_candidates_count,
        'upcoming_interactions': [{
            'id': interaction.id,
            'candidate_id': interaction.candidate_id,
            'candidate_name': f"{interaction.candidate.first_name or ''} {interaction.candidate.name or ''}".strip(),
            'next_step': interaction.next_step,
            'next_step_date': interaction.next_step_date.isoformat() if interaction.next_step_date else None,
            'type': interaction.type
        } for interaction in upcoming_interactions[:10]]  # Limit to 10 upcoming interactions
    })

# Serve frontend
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if path and os.path.exists(os.path.join('../frontend', path)):
        return send_from_directory('../frontend', path)
    return send_from_directory('../frontend', 'index.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
