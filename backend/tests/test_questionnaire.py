from app.services.questionnaire_engine import QuestionnaireEngine
from app.models import Answer

def test_multilingual_questions_loaded():
    en_q = QuestionnaireEngine.get_questions_for_language("English")
    hi_q = QuestionnaireEngine.get_questions_for_language("Hindi")
    bn_q = QuestionnaireEngine.get_questions_for_language("Bengali")

    assert len(en_q) >= 10
    assert len(hi_q) >= 10
    assert len(bn_q) >= 10
    assert "problem" in en_q[0]["question_text"].lower()
    assert "लक्षण" in hi_q[0]["question_text"]
    assert "লক্ষণ" in bn_q[0]["question_text"]

def test_adaptive_branching_skip_pain_detail():
    # If question 4 (pain) is answered 'No', question 5 (pain location/character) should be skipped
    answers = [
        Answer(question_id=1, answer="Routine checkup", category="Chief Complaint"),
        Answer(question_id=2, answer="1 to 2 weeks", category="Duration"),
        Answer(question_id=3, answer="Mild", category="Severity"),
        Answer(question_id=4, answer="No", category="Symptoms")
    ]
    next_q = QuestionnaireEngine.determine_next_question(answers, "English")
    assert next_q is not None
    # Next question should be 6 (Past medical history), not 5 (pain details)
    assert next_q["id"] == 6

def test_adaptive_branching_include_pain_detail():
    # If question 4 (pain) is answered 'Yes', question 5 (pain location/character) MUST be asked
    answers = [
        Answer(question_id=1, answer="Severe chest discomfort", category="Chief Complaint"),
        Answer(question_id=2, answer="Just today", category="Duration"),
        Answer(question_id=3, answer="Severe", category="Severity"),
        Answer(question_id=4, answer="Yes", category="Symptoms")
    ]
    next_q = QuestionnaireEngine.determine_next_question(answers, "English")
    assert next_q is not None
    assert next_q["id"] == 5
