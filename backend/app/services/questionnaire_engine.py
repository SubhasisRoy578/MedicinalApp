from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models import Question, Answer, Consultation

QUESTIONS_CATALOG: List[Dict[str, Any]] = [
    # 1. Chief Complaint
    {
        "category": "Chief Complaint",
        "order_index": 1,
        "question_type": "text",
        "required": True,
        "translations": {
            "English": "What is the main health problem or symptom bringing you to see the doctor today?",
            "Hindi": "आज डॉक्टर से मिलने का आपका मुख्य स्वास्थ्य कारण या लक्षण क्या है?",
            "Bengali": "আজ ডাক্তারের সাথে দেখা করার প্রধান স্বাস্থ্য সমস্যা বা লক্ষণ কী?"
        },
        "options": None,
        "trigger_value": None,
        "parent_question_id": None
    },
    # 2. Symptoms Onset & Duration
    {
        "category": "Duration",
        "order_index": 2,
        "question_type": "choice",
        "required": True,
        "translations": {
            "English": "When did these symptoms first begin, or how long have you been feeling this way?",
            "Hindi": "यह लक्षण सबसे पहले कब शुरू हुए, या आपको कितने समय से ऐसा महसूस हो रहा है?",
            "Bengali": "এই লক্ষণগুলি প্রথম কবে শুরু হয়েছিল বা আপনি কতদিন ধরে এমন অনুভব করছেন?"
        },
        "options": [
            "Just today / Less than 24 hours",
            "A few days (2-6 days)",
            "1 to 2 weeks",
            "1 to 3 months",
            "More than 3 months (Chronic)"
        ],
        "trigger_value": None,
        "parent_question_id": None
    },
    # 3. Severity & Progression
    {
        "category": "Severity",
        "order_index": 3,
        "question_type": "choice",
        "required": True,
        "translations": {
            "English": "How would you rate the severity and progression of your symptoms?",
            "Hindi": "आप अपने लक्षणों की गंभीरता और स्थिति को कैसे आंकेंगे?",
            "Bengali": "আপনার লক্ষণের তীব্রতা এবং অগ্রগতি কেমন?"
        },
        "options": [
            "Mild - Noticeable but doesn't affect daily tasks",
            "Moderate - Uncomfortable and limits some activities",
            "Severe - Significantly impacting daily routine / rest",
            "Fluctuating - Comes and goes in episodes",
            "Getting progressively worse"
        ],
        "trigger_value": None,
        "parent_question_id": None
    },
    # 4. Pain Specifics (Adaptive branch)
    {
        "category": "Symptoms",
        "order_index": 4,
        "question_type": "choice",
        "required": True,
        "translations": {
            "English": "Are you currently experiencing physical pain or acute discomfort?",
            "Hindi": "क्या आपको वर्तमान में कोई शारीरिक दर्द या तीव्र बेचैनी महसूस हो रही है?",
            "Bengali": "আপনি কি বর্তমানে কোনো শারীরিক ব্যথা বা তীব্র অস্বস্তি অনুভব করছেন?"
        },
        "options": ["Yes", "No", "Mild/Intermittent", "Not sure"],
        "trigger_value": None,
        "parent_question_id": None
    },
    # Follow-up for Pain (Triggered by Yes / Mild)
    {
        "category": "Symptoms",
        "order_index": 5,
        "question_type": "text",
        "required": False,
        "translations": {
            "English": "Where is the pain located, and how would you describe it (e.g., sharp, dull ache, burning, throbbing)?",
            "Hindi": "दर्द किस जगह पर है, और आप इसे कैसे समझाएंगे (जैसे: तेज, हल्का, जलन, या धड़कन जैसा)?",
            "Bengali": "ব্যথাটি শরীরের কোথায় এবং এটি কেমন ধরণের (যেমন: তীব্র, হালকা, জ্বালা করা বা চিনচিন করা)?"
        },
        "options": ["Chest / Heart area", "Head / Neck", "Abdomen / Stomach", "Joints / Back", "Throat / Respiratory"],
        "trigger_value": "pain_yes",
        "parent_question_id": 4
    },
    # 5. Past Medical History
    {
        "category": "Previous illnesses",
        "order_index": 6,
        "question_type": "choice",
        "required": True,
        "translations": {
            "English": "Do you have any diagnosed medical conditions or chronic illnesses?",
            "Hindi": "क्या आपको पहले से कोई पहचानी गई बीमारी या पुरानी स्वास्थ्य समस्या है?",
            "Bengali": "আপনার কি পূর্বে কোনো দীর্ঘস্থায়ী রোগ বা চিহ্নিত স্বাস্থ্য সমস্যা আছে?"
        },
        "options": [
            "Diabetes (High Blood Sugar)",
            "Hypertension (High Blood Pressure)",
            "Heart Disease / Previous Stent / Attack",
            "Asthma / COPD / Respiratory Issues",
            "Thyroid Disorder",
            "Kidney or Liver condition",
            "None / No known conditions",
            "Other chronic condition"
        ],
        "trigger_value": None,
        "parent_question_id": None
    },
    # Follow-up for Chronic condition
    {
        "category": "Previous illnesses",
        "order_index": 7,
        "question_type": "text",
        "required": False,
        "translations": {
            "English": "Please mention how long you have had this condition and if you monitor it regularly:",
            "Hindi": "कृपया बताएं कि आपको यह स्थिति कितने समय से है और क्या आप नियमित जांच करते हैं:",
            "Bengali": "দয়া করে উল্লেখ করুন আপনার এই সমস্যা কতদিন ধরে আছে এবং নিয়মিত পরীক্ষা করেন কিনা:"
        },
        "options": ["Well controlled with medication", "Recently diagnosed (< 1 year)", "Irregularly checked", "Not sure"],
        "trigger_value": "chronic_yes",
        "parent_question_id": 6
    },
    # 6. Current Medications
    {
        "category": "Current medications",
        "order_index": 8,
        "question_type": "choice",
        "required": True,
        "translations": {
            "English": "Are you currently taking any prescription medicines, supplements, or over-the-counter drugs?",
            "Hindi": "क्या आप वर्तमान में कोई डॉक्टर की दवाएं, सप्लीमेंट्स या नियमित गोलियां ले रहे हैं?",
            "Bengali": "আপনি কি বর্তমানে কোনো প্রেসক্রিপশন ওষুধ, ভিটামিন বা নিয়মিত কোনো ওষুধ খাচ্ছেন?"
        },
        "options": ["Yes", "No", "Only occasionally / as needed", "Not sure"],
        "trigger_value": None,
        "parent_question_id": None
    },
    # Follow-up for Medications
    {
        "category": "Current medications",
        "order_index": 9,
        "question_type": "text",
        "required": False,
        "translations": {
            "English": "Please list the names of the medications you take and their daily frequency (e.g., Metformin 500mg once daily):",
            "Hindi": "कृपया उन दवाओं के नाम और खुराक लिखें जो आप लेते हैं (जैसे: मेटफॉर्मिन 500mg रोज एक बार):",
            "Bengali": "দয়া করে আপনার নিয়মিত ওষুধের নাম এবং খাওয়ার নিয়ম লিখুন (যেমন: মেটফর্মিন ৫০০ মিগ্রা দিনে একবার):"
        },
        "options": ["Taking regularly as prescribed", "Missed a few doses recently", "Uploaded in my prescription report"],
        "trigger_value": "meds_yes",
        "parent_question_id": 8
    },
    # 7. Allergies
    {
        "category": "Allergies",
        "order_index": 10,
        "question_type": "choice",
        "required": True,
        "translations": {
            "English": "Do you have any known allergies to medicines, foods, or other substances?",
            "Hindi": "क्या आपको किसी दवा, भोजन, या अन्य चीज से एलर्जी है?",
            "Bengali": "আপনার কি কোনো ওষুধ, খাবার বা অন্য কোনো জিনিসে অ্যালার্জি আছে?"
        },
        "options": [
            "No known allergies (NKDA)",
            "Penicillin / Antibiotics",
            "Painkillers / NSAIDs (e.g. Aspirin, Ibuprofen)",
            "Certain Foods (Peanuts, Seafood, Dairy)",
            "Dust / Pollen / Seasonal Allergies",
            "Yes, other (specify)"
        ],
        "trigger_value": None,
        "parent_question_id": None
    },
    # 8. Previous Surgeries / Hospitalizations
    {
        "category": "Previous surgeries",
        "order_index": 11,
        "question_type": "choice",
        "required": True,
        "translations": {
            "English": "Have you ever undergone any surgeries or been hospitalized in the past?",
            "Hindi": "क्या आपकी पहले कभी कोई सर्जरी (ऑपरेशन) हुई है या आप अस्पताल में भर्ती हुए हैं?",
            "Bengali": "আপনার কি পূর্বে কোনো সার্জারি (অস্ত্রোপচার) হয়েছিল বা হাসপাতালে ভর্তি হতে হয়েছিল?"
        },
        "options": [
            "No prior surgeries or hospital stays",
            "Yes - Minor surgery / procedure",
            "Yes - Major surgery (Cardiac, Orthopedic, Abdominal)",
            "Hospitalization for medical illness",
            "Not sure"
        ],
        "trigger_value": None,
        "parent_question_id": None
    },
    # Follow-up for Surgery
    {
        "category": "Previous surgeries",
        "order_index": 12,
        "question_type": "text",
        "required": False,
        "translations": {
            "English": "Please briefly specify the surgery/procedure and approximate year or hospital name:",
            "Hindi": "कृपया सर्जरी/उपचार का संक्षिप्त विवरण और अनुमानित वर्ष बताएं:",
            "Bengali": "দয়া করে সার্জারি/চিকিৎসার বিবরণ এবং আনুমানিক সাল উল্লেখ করুন:"
        },
        "options": ["More than 5 years ago", "1 to 5 years ago", "Within the last 12 months"],
        "trigger_value": "surgery_yes",
        "parent_question_id": 11
    },
    # 9. Family History
    {
        "category": "Family history",
        "order_index": 13,
        "question_type": "choice",
        "required": True,
        "translations": {
            "English": "Is there any history of major illnesses in your immediate family (parents, siblings)?",
            "Hindi": "क्या आपके परिवार (माता-पिता, भाई-बहन) में किसी गंभीर बीमारी का पारिवारिक इतिहास है?",
            "Bengali": "আপনার পরিবারে (পিতা-মাতা, ভাই-বোন) কি কোনো প্রধান রোগের পারিবারিক ইতিহাস আছে?"
        },
        "options": [
            "No significant family history",
            "High Blood Pressure / Hypertension",
            "Diabetes Type 2",
            "Early Heart Attack / CAD",
            "Stroke",
            "Cancer",
            "Asthma / Allergies",
            "Other / Not sure"
        ],
        "trigger_value": None,
        "parent_question_id": None
    },
    # 10. Lifestyle & Habits
    {
        "category": "Lifestyle",
        "order_index": 14,
        "question_type": "choice",
        "required": True,
        "translations": {
            "English": "Which of the following describes your lifestyle habits (tobacco, alcohol, sleep)?",
            "Hindi": "आपकी जीवनशैली की आदतें (तंबाकू, शराब, नींद) कैसी हैं?",
            "Bengali": "আপনার জীবনযাত্রার অভ্যাস (ধূমপান, অ্যালকোহল, ঘুম) কেমন?"
        },
        "options": [
            "Non-smoker, non-drinker, adequate sleep (7-8 hrs)",
            "Occasional alcohol, non-smoker",
            "Current smoker / tobacco user",
            "Irregular sleep / high stress",
            "Sedentary lifestyle / minimal exercise",
            "Prefer not to answer"
        ],
        "trigger_value": None,
        "parent_question_id": None
    },
    # 11. Additional Information & Patient Remarks
    {
        "category": "Other relevant information",
        "order_index": 15,
        "question_type": "text",
        "required": False,
        "translations": {
            "English": "Is there anything else you would like the doctor to know about your condition, worries, or health goals?",
            "Hindi": "क्या कोई अन्य महत्वपूर्ण बात है जो आप डॉक्टर को अपनी स्थिति, चिंता या स्वास्थ्य के बारे में बताना चाहते हैं?",
            "Bengali": "আপনার স্বাস্থ্য, উদ্বেগ বা চিকিৎসার ব্যাপারে ডাক্তারকে জানানোর মতো অন্য কিছু কি আছে?"
        },
        "options": [
            "Need prescription renewal",
            "Experiencing side effects from current medication",
            "Second opinion regarding diagnosis",
            "General health checkup review",
            "No other comments"
        ],
        "trigger_value": None,
        "parent_question_id": None
    }
]


AYUSH_QUESTIONS_CATALOG: List[Dict[str, Any]] = [
    {
        "category": "AYUSH - Prakriti",
        "order_index": 101,
        "question_type": "text",
        "required": False,
        "translations": {
            "English": "For the AYUSH clinician: have you previously been assessed for Prakriti (constitutional type)? If yes, what was recorded?",
            "Hindi": "आयुष चिकित्सक के लिए: क्या आपकी प्रकृति (Prakriti) का पहले आकलन हुआ है? यदि हाँ, तो क्या दर्ज किया गया था?",
            "Bengali": "আয়ুষ চিকিৎসকের জন্য: আপনার প্রকৃতি (Prakriti) কি আগে মূল্যায়ন করা হয়েছিল? হলে কী নথিভুক্ত হয়েছিল?"
        },
        "options": None, "trigger_value": None, "parent_question_id": None
    },
    {
        "category": "AYUSH - Vikriti",
        "order_index": 102,
        "question_type": "text",
        "required": False,
        "translations": {
            "English": "Has an AYUSH practitioner previously documented a Vikriti (current imbalance) assessment? If yes, please describe what was recorded.",
            "Hindi": "क्या किसी आयुष चिकित्सक ने पहले आपकी विकृति (वर्तमान असंतुलन) का आकलन दर्ज किया है? यदि हाँ, विवरण दें।",
            "Bengali": "কোনও আয়ুষ চিকিৎসক কি আগে আপনার বিকৃতি (বর্তমান ভারসাম্যহীনতা) মূল্যায়ন নথিভুক্ত করেছেন? হলে কী লেখা হয়েছিল?"
        },
        "options": None, "trigger_value": None, "parent_question_id": None
    },
    {
        "category": "AYUSH - Agni",
        "order_index": 103,
        "question_type": "choice",
        "required": False,
        "translations": {
            "English": "How would you describe your digestion (Agni) based on your usual experience?",
            "Hindi": "अपने सामान्य अनुभव के आधार पर आप अपने पाचन (Agni) को कैसे वर्णित करेंगे?",
            "Bengali": "আপনার সাধারণ অভিজ্ঞতার ভিত্তিতে আপনার হজম (Agni) কেমন বলে মনে হয়?"
        },
        "options": [
            "Regular / comfortable",
            "Variable / irregular",
            "Often slow or heavy after meals",
            "Often unusually strong or frequent hunger",
            "Not sure / prefer to discuss with practitioner"
        ],
        "trigger_value": None, "parent_question_id": None
    },
    {
        "category": "AYUSH - Koshtha",
        "order_index": 104,
        "question_type": "choice",
        "required": False,
        "translations": {
            "English": "How would you describe your usual bowel pattern (Koshtha)?",
            "Hindi": "आप अपनी सामान्य मल त्याग की आदत (Koshtha) को कैसे वर्णित करेंगे?",
            "Bengali": "আপনার স্বাভাবিক মলত্যাগের ধরন (Koshtha) কেমন?"
        },
        "options": [
            "Regular",
            "Often hard / infrequent",
            "Often loose / frequent",
            "Variable",
            "Not sure"
        ],
        "trigger_value": None, "parent_question_id": None
    },
    {
        "category": "AYUSH - Ahara",
        "order_index": 105,
        "question_type": "text",
        "required": False,
        "translations": {
            "English": "Please describe your usual Ahara (diet): meal pattern, commonly eaten foods, and any foods you avoid.",
            "Hindi": "अपना सामान्य आहार (Ahara) बताएं: भोजन का समय, सामान्य भोजन और किन खाद्य पदार्थों से परहेज़ करते हैं।",
            "Bengali": "আপনার স্বাভাবিক আহার (Ahara) সম্পর্কে বলুন: খাবারের সময়, সাধারণ খাবার এবং কোন খাবার এড়িয়ে চলেন।"
        },
        "options": None, "trigger_value": None, "parent_question_id": None
    },
    {
        "category": "AYUSH - Vihara",
        "order_index": 106,
        "question_type": "text",
        "required": False,
        "translations": {
            "English": "Please describe relevant Vihara (daily routine/lifestyle): sleep, activity, work routine, and stress.",
            "Hindi": "अपनी दिनचर्या/जीवनशैली (Vihara) के बारे में बताएं: नींद, गतिविधि, काम की दिनचर्या और तनाव।",
            "Bengali": "আপনার দৈনন্দিন রুটিন/জীবনযাপন (Vihara) সম্পর্কে বলুন: ঘুম, কাজ, শারীরিক কার্যকলাপ এবং চাপ।"
        },
        "options": None, "trigger_value": None, "parent_question_id": None
    },
]

class QuestionnaireEngine:
    @staticmethod
    def get_questions_for_language(language: str = "English", mode: str = "GENERAL") -> List[Dict[str, Any]]:
        lang = language if language in ["English", "Hindi", "Bengali"] else "English"
        result = []
        catalog = QUESTIONS_CATALOG + (AYUSH_QUESTIONS_CATALOG if mode == "AYUSH" else [])
        for q in catalog:
            q_copy = {
                "id": q["order_index"],
                "category": q["category"],
                "order_index": q["order_index"],
                "question_type": q["question_type"],
                "required": q["required"],
                "options": q["options"],
                "parent_question_id": q["parent_question_id"],
                "trigger_value": q["trigger_value"],
                "language": lang,
                "question_text": q["translations"].get(lang, q["translations"]["English"])
            }
            result.append(q_copy)
        return result

    @staticmethod
    def determine_next_question(
        answers: List[Answer],
        language: str = "English",
        mode: str = "GENERAL"
    ) -> Optional[Dict[str, Any]]:
        """
        Adaptive branching logic:
        Examines previous answers and determines the next most clinically relevant question.
        Skips conditional follow-up questions if parent question was negative.
        """
        all_questions = QuestionnaireEngine.get_questions_for_language(language, mode)
        answered_order_indices = {a.question_id for a in answers if a.question_id is not None}

        # Build answers map by question_id
        answer_text_by_id = {}
        for a in answers:
            if a.question_id:
                answer_text_by_id[a.question_id] = (a.answer or "").strip()

        for q in all_questions:
            q_id = q["id"]
            if q_id in answered_order_indices:
                continue

            # Check if this is a conditional follow-up question
            parent_id = q.get("parent_question_id")
            trigger = q.get("trigger_value")

            if parent_id is not None:
                parent_ans = answer_text_by_id.get(parent_id, "")
                parent_ans_lower = parent_ans.lower()

                # Pain follow-up (Question 5 after Question 4)
                if trigger == "pain_yes":
                    if not any(k in parent_ans_lower for k in ["yes", "mild", "intermittent", "severe", "pain", "discomfort", "हाँ", "হ্যাঁ"]):
                        # Skip this pain detail question if patient answered No
                        continue

                # Chronic condition follow-up (Question 7 after Question 6)
                elif trigger == "chronic_yes":
                    if any(k in parent_ans_lower for k in ["none", "no known", "नहीं", "নেই", "না"]):
                        continue

                # Medications follow-up (Question 9 after Question 8)
                elif trigger == "meds_yes":
                    if any(k in parent_ans_lower for k in ["no", "नहीं", "না", "none", "never"]):
                        continue

                # Surgery follow-up (Question 12 after Question 11)
                elif trigger == "surgery_yes":
                    if any(k in parent_ans_lower for k in ["no prior", "no", "नहीं", "না", "none"]):
                        continue

            # Return the first eligible unanswered question
            return q

        # All eligible questions answered
        return None

    @staticmethod
    def calculate_progress(answers: List[Answer], mode: str = "GENERAL") -> int:
        total = len(QuestionnaireEngine.get_questions_for_language("English", mode))
        answered_count = len({a.question_id for a in answers if a.question_id is not None})
        if total == 0 or answered_count == 0:
            return 0
        return int(min(100, (answered_count / total) * 100))
