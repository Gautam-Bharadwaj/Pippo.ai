import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_score, recall_score, f1_score
import joblib
import os

# Set plotting style
plt.style.use('ggplot')

def train_and_save_model():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_path = os.path.join(base_dir, 'data', 'processed', 'cleaned_legal_clauses.csv')
    assets_dir = os.path.join(base_dir, 'assets')
    os.makedirs(assets_dir, exist_ok=True)
    
    if not os.path.exists(data_path):
        print(f"Data not found at {data_path}. Creating dummy data for training.")
        # Pre-creating some dummy data if file missing to avoid crash
        df = pd.DataFrame({
            'cleaned_text': ['this is a safe clause', 'the company is liable', 'prior approval needed', 'we agree to pay'],
            'clause_status': [0, 1, 1, 0]
        })
    else:
        df = pd.read_csv(data_path)
    
    df.dropna(subset=['cleaned_text', 'clause_status'], inplace=True)
    
    X = df['cleaned_text']
    y = df['clause_status'].astype(int)
    
    # 1. Train-Test Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # 2. Pipeline Definition
    model = Pipeline([
        ('vectorizer', TfidfVectorizer(max_features=2000, stop_words='english')),
        ('classifier', RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1))
    ])
    
    # 3. Cross-Validation
    print("Performing 5-fold Cross-Validation...")
    cv_scores = cross_val_score(model, X, y, cv=5)
    print(f"Cross-Validation Accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")
    
    # 4. Training
    model.fit(X_train, y_train)
    
    # 5. Evaluation
    predictions = model.predict(X_test)
    report = classification_report(y_test, predictions, output_dict=True)
    
    print("\n--- Model Evaluation ---")
    print(f"Accuracy:  {accuracy_score(y_test, predictions):.4f}")
    print(f"Precision: {precision_score(y_test, predictions):.4f}")
    print(f"Recall:    {recall_score(y_test, predictions):.4f}")
    print(f"F1 Score:  {f1_score(y_test, predictions):.4f}")
    
    # 6. Confusion Matrix Plot
    plt.figure(figsize=(8, 6))
    cm = confusion_matrix(y_test, predictions)
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=['Safe', 'Risky'], yticklabels=['Safe', 'Risky'])
    plt.title('Unbiased Legal Audit: Confusion Matrix')
    plt.ylabel('Actual Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    plt.savefig(os.path.join(assets_dir, 'confusion_matrix.png'))
    plt.close()
    
    # 7. Feature Importance Plot
    vectorizer = model.named_steps['vectorizer']
    classifier = model.named_steps['classifier']
    feature_names = vectorizer.get_feature_names_out()
    importances = classifier.feature_importances_
    
    # Get top 20 features
    indices = np.argsort(importances)[-20:]
    
    plt.figure(figsize=(10, 8))
    plt.title('Top 20 Critical Risk Tokens (Feature Importance)')
    plt.barh(range(len(indices)), importances[indices], color='b', align='center')
    plt.yticks(range(len(indices)), [feature_names[i] for i in indices])
    plt.xlabel('Relative Gini Importance')
    plt.tight_layout()
    plt.savefig(os.path.join(assets_dir, 'feature_importance.png'))
    plt.close()
    
    # 8. Save Model
    models_dir = os.path.join(base_dir, 'models')
    os.makedirs(models_dir, exist_ok=True)
    
    model_path = os.path.join(models_dir, 'risk_model.pkl')
    joblib.dump(model, model_path)
    
    # Save metrics to a JSON for the report generator
    metrics = {
        'cv_mean': cv_scores.mean(),
        'accuracy': accuracy_score(y_test, predictions),
        'precision': precision_score(y_test, predictions),
        'recall': recall_score(y_test, predictions),
        'f1': f1_score(y_test, predictions)
    }
    with open(os.path.join(assets_dir, 'model_metrics.json'), 'w') as f:
        json.dump(metrics, f)
        
    print("Model training complete. Assets (CM, FI, Metrics) saved to backend/assets/.")

import json
if __name__ == '__main__':
    train_and_save_model()
