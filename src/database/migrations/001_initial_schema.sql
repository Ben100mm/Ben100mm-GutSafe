-- Initial Database Schema Migration
-- Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    email TEXT,
    name TEXT,
    preferences TEXT NOT NULL, -- JSON
    settings TEXT NOT NULL, -- JSON
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Gut Profiles Table
CREATE TABLE IF NOT EXISTS gut_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    conditions TEXT NOT NULL, -- JSON
    preferences TEXT NOT NULL, -- JSON
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user_profiles(user_id)
);

-- Food Items Table
CREATE TABLE IF NOT EXISTS food_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    barcode TEXT UNIQUE,
    brand TEXT,
    category TEXT,
    ingredients TEXT NOT NULL, -- JSON array
    allergens TEXT NOT NULL, -- JSON array
    additives TEXT NOT NULL, -- JSON array
    nutritional_info TEXT, -- JSON
    gut_health_info TEXT NOT NULL, -- JSON
    data_source TEXT NOT NULL,
    image_url TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT 0,
    verification_date DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Scan Analysis Table
CREATE TABLE IF NOT EXISTS scan_analysis (
    id TEXT PRIMARY KEY,
    food_item_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    overall_safety TEXT NOT NULL CHECK (overall_safety IN ('safe', 'caution', 'avoid')),
    confidence REAL NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    flagged_ingredients TEXT NOT NULL, -- JSON array
    condition_warnings TEXT NOT NULL, -- JSON array
    safe_alternatives TEXT NOT NULL, -- JSON array
    explanation TEXT NOT NULL,
    data_source TEXT NOT NULL,
    is_user_verified BOOLEAN NOT NULL DEFAULT 0,
    user_feedback TEXT CHECK (user_feedback IN ('accurate', 'inaccurate')),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (food_item_id) REFERENCES food_items(id),
    FOREIGN KEY (user_id) REFERENCES user_profiles(user_id)
);

-- Scan History Table
CREATE TABLE IF NOT EXISTS scan_history (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    food_item_id TEXT NOT NULL,
    analysis_id TEXT NOT NULL,
    timestamp DATETIME NOT NULL,
    location TEXT, -- JSON
    device_info TEXT, -- JSON
    is_offline BOOLEAN NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user_profiles(user_id),
    FOREIGN KEY (food_item_id) REFERENCES food_items(id),
    FOREIGN KEY (analysis_id) REFERENCES scan_analysis(id)
);

-- Gut Symptoms Table
CREATE TABLE IF NOT EXISTS gut_symptoms (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN (
        'bloating', 'cramping', 'diarrhea', 'constipation', 'gas', 'nausea',
        'reflux', 'fatigue', 'headache', 'skin_irritation', 'other'
    )),
    severity INTEGER NOT NULL CHECK (severity >= 1 AND severity <= 10),
    description TEXT,
    duration INTEGER NOT NULL, -- minutes
    timestamp DATETIME NOT NULL,
    potential_triggers TEXT NOT NULL, -- JSON array
    location TEXT CHECK (location IN (
        'upper_abdomen', 'lower_abdomen', 'full_abdomen', 'chest', 'general'
    )),
    related_foods TEXT, -- JSON array of food item IDs
    weather TEXT, -- JSON
    mood INTEGER CHECK (mood >= 1 AND mood <= 10),
    stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user_profiles(user_id)
);

-- Medications/Supplements Table
CREATE TABLE IF NOT EXISTS medications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN (
        'medication', 'supplement', 'probiotic', 'enzyme', 'antacid', 'other'
    )),
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN (
        'daily', 'twice_daily', 'as_needed', 'weekly', 'monthly'
    )),
    start_date DATETIME NOT NULL,
    end_date DATETIME,
    is_active BOOLEAN NOT NULL,
    notes TEXT,
    gut_related BOOLEAN NOT NULL,
    category TEXT CHECK (category IN (
        'digestive_aid', 'anti_inflammatory', 'probiotic', 'enzyme_support',
        'acid_control', 'immune_support', 'other'
    )),
    side_effects TEXT, -- JSON array
    effectiveness INTEGER CHECK (effectiveness >= 1 AND effectiveness <= 10),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user_profiles(user_id)
);

-- Safe Foods Table
CREATE TABLE IF NOT EXISTS safe_foods (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    food_item_id TEXT NOT NULL,
    added_date DATETIME NOT NULL,
    last_used DATETIME,
    usage_count INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    is_favorite BOOLEAN NOT NULL DEFAULT 0,
    tags TEXT, -- JSON array
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user_profiles(user_id),
    FOREIGN KEY (food_item_id) REFERENCES food_items(id)
);

-- Analytics Data Table
CREATE TABLE IF NOT EXISTS analytics_data (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    date DATE NOT NULL,
    total_scans INTEGER NOT NULL DEFAULT 0,
    safe_scans INTEGER NOT NULL DEFAULT 0,
    caution_scans INTEGER NOT NULL DEFAULT 0,
    avoid_scans INTEGER NOT NULL DEFAULT 0,
    symptoms_reported INTEGER NOT NULL DEFAULT 0,
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
    sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
    mood INTEGER CHECK (mood >= 1 AND mood <= 10),
    stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
    water_intake REAL, -- liters
    exercise_minutes INTEGER,
    weather TEXT, -- JSON
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user_profiles(user_id),
    UNIQUE(user_id, date)
);

-- Food Trends Table
CREATE TABLE IF NOT EXISTS food_trends (
    id TEXT PRIMARY KEY,
    food_name TEXT NOT NULL,
    total_scans INTEGER NOT NULL DEFAULT 0,
    safe_count INTEGER NOT NULL DEFAULT 0,
    caution_count INTEGER NOT NULL DEFAULT 0,
    avoid_count INTEGER NOT NULL DEFAULT 0,
    last_scanned DATETIME NOT NULL,
    trend TEXT NOT NULL CHECK (trend IN ('improving', 'stable', 'declining')),
    confidence REAL NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    category TEXT,
    brand TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Ingredient Analysis Table
CREATE TABLE IF NOT EXISTS ingredient_analysis (
    id TEXT PRIMARY KEY,
    ingredient TEXT NOT NULL,
    is_problematic BOOLEAN NOT NULL,
    is_hidden BOOLEAN NOT NULL,
    detected_triggers TEXT NOT NULL, -- JSON array
    confidence REAL NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    category TEXT NOT NULL,
    risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'moderate', 'high', 'severe')),
    recommendations TEXT NOT NULL, -- JSON
    last_analyzed DATETIME NOT NULL,
    data_source TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_gut_profiles_user_id ON gut_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_food_items_barcode ON food_items(barcode);
CREATE INDEX IF NOT EXISTS idx_food_items_name ON food_items(name);
CREATE INDEX IF NOT EXISTS idx_food_items_category ON food_items(category);
CREATE INDEX IF NOT EXISTS idx_food_items_brand ON food_items(brand);
CREATE INDEX IF NOT EXISTS idx_scan_history_user_id ON scan_history(user_id);
CREATE INDEX IF NOT EXISTS idx_scan_history_timestamp ON scan_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_scan_history_food_item_id ON scan_history(food_item_id);
CREATE INDEX IF NOT EXISTS idx_scan_analysis_user_id ON scan_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_scan_analysis_food_item_id ON scan_analysis(food_item_id);
CREATE INDEX IF NOT EXISTS idx_gut_symptoms_user_id ON gut_symptoms(user_id);
CREATE INDEX IF NOT EXISTS idx_gut_symptoms_timestamp ON gut_symptoms(timestamp);
CREATE INDEX IF NOT EXISTS idx_gut_symptoms_type ON gut_symptoms(type);
CREATE INDEX IF NOT EXISTS idx_medications_user_id ON medications(user_id);
CREATE INDEX IF NOT EXISTS idx_medications_active ON medications(is_active);
CREATE INDEX IF NOT EXISTS idx_medications_type ON medications(type);
CREATE INDEX IF NOT EXISTS idx_safe_foods_user_id ON safe_foods(user_id);
CREATE INDEX IF NOT EXISTS idx_safe_foods_food_item_id ON safe_foods(food_item_id);
CREATE INDEX IF NOT EXISTS idx_safe_foods_usage_count ON safe_foods(usage_count);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics_data(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics_data(date);
CREATE INDEX IF NOT EXISTS idx_food_trends_food_name ON food_trends(food_name);
CREATE INDEX IF NOT EXISTS idx_food_trends_trend ON food_trends(trend);
CREATE INDEX IF NOT EXISTS idx_ingredient_analysis_ingredient ON ingredient_analysis(ingredient);
CREATE INDEX IF NOT EXISTS idx_ingredient_analysis_risk_level ON ingredient_analysis(risk_level);
