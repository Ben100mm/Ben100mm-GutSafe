-- Initial Database Schema Migration for Backend
-- Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.

-- Enable UUID extension for PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    last_login TIMESTAMP,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    preferences JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Gut profiles table
CREATE TABLE IF NOT EXISTS gut_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conditions JSONB NOT NULL DEFAULT '{}',
    preferences JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Food items table
CREATE TABLE IF NOT EXISTS food_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    barcode VARCHAR(50) UNIQUE,
    brand VARCHAR(100),
    category VARCHAR(100),
    ingredients JSONB NOT NULL DEFAULT '[]',
    allergens JSONB NOT NULL DEFAULT '[]',
    additives JSONB NOT NULL DEFAULT '[]',
    nutritional_info JSONB,
    gut_health_info JSONB NOT NULL DEFAULT '{}',
    data_source VARCHAR(50) NOT NULL,
    image_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scan analysis table
CREATE TABLE IF NOT EXISTS scan_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    food_item_id UUID NOT NULL REFERENCES food_items(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    overall_safety VARCHAR(20) NOT NULL CHECK (overall_safety IN ('safe', 'caution', 'avoid')),
    confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    flagged_ingredients JSONB NOT NULL DEFAULT '[]',
    condition_warnings JSONB NOT NULL DEFAULT '[]',
    safe_alternatives JSONB NOT NULL DEFAULT '[]',
    explanation TEXT NOT NULL,
    data_source VARCHAR(50) NOT NULL,
    is_user_verified BOOLEAN DEFAULT FALSE,
    user_feedback VARCHAR(20) CHECK (user_feedback IN ('accurate', 'inaccurate')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scan history table
CREATE TABLE IF NOT EXISTS scan_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    food_item_id UUID NOT NULL REFERENCES food_items(id) ON DELETE CASCADE,
    analysis_id UUID NOT NULL REFERENCES scan_analysis(id) ON DELETE CASCADE,
    timestamp TIMESTAMP NOT NULL,
    location JSONB,
    device_info JSONB,
    is_offline BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gut symptoms table
CREATE TABLE IF NOT EXISTS gut_symptoms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'bloating', 'cramping', 'diarrhea', 'constipation', 'gas', 'nausea',
        'reflux', 'fatigue', 'headache', 'skin_irritation', 'other'
    )),
    severity INTEGER NOT NULL CHECK (severity >= 1 AND severity <= 10),
    description TEXT,
    duration INTEGER NOT NULL, -- minutes
    timestamp TIMESTAMP NOT NULL,
    potential_triggers JSONB NOT NULL DEFAULT '[]',
    location VARCHAR(50) CHECK (location IN (
        'upper_abdomen', 'lower_abdomen', 'full_abdomen', 'chest', 'general'
    )),
    related_foods JSONB DEFAULT '[]',
    weather JSONB,
    mood INTEGER CHECK (mood >= 1 AND mood <= 10),
    stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Medications/Supplements table
CREATE TABLE IF NOT EXISTS medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'medication', 'supplement', 'probiotic', 'enzyme', 'antacid', 'other'
    )),
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN (
        'daily', 'twice_daily', 'as_needed', 'weekly', 'monthly'
    )),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    is_active BOOLEAN NOT NULL,
    notes TEXT,
    gut_related BOOLEAN NOT NULL,
    category VARCHAR(50) CHECK (category IN (
        'digestive_aid', 'anti_inflammatory', 'probiotic', 'enzyme_support',
        'acid_control', 'immune_support', 'other'
    )),
    side_effects JSONB DEFAULT '[]',
    effectiveness INTEGER CHECK (effectiveness >= 1 AND effectiveness <= 10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Safe foods table
CREATE TABLE IF NOT EXISTS safe_foods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    food_item_id UUID NOT NULL REFERENCES food_items(id) ON DELETE CASCADE,
    added_date TIMESTAMP NOT NULL,
    last_used TIMESTAMP,
    usage_count INTEGER DEFAULT 0,
    notes TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    tags JSONB DEFAULT '[]',
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, food_item_id)
);

-- Analytics data table
CREATE TABLE IF NOT EXISTS analytics_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_scans INTEGER DEFAULT 0,
    safe_scans INTEGER DEFAULT 0,
    caution_scans INTEGER DEFAULT 0,
    avoid_scans INTEGER DEFAULT 0,
    symptoms_reported INTEGER DEFAULT 0,
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
    sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
    mood INTEGER CHECK (mood >= 1 AND mood <= 10),
    stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
    water_intake DECIMAL(5,2), -- liters
    exercise_minutes INTEGER,
    weather JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
);

-- Food trends table
CREATE TABLE IF NOT EXISTS food_trends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    food_name VARCHAR(255) NOT NULL,
    total_scans INTEGER DEFAULT 0,
    safe_count INTEGER DEFAULT 0,
    caution_count INTEGER DEFAULT 0,
    avoid_count INTEGER DEFAULT 0,
    last_scanned TIMESTAMP NOT NULL,
    trend VARCHAR(20) NOT NULL CHECK (trend IN ('improving', 'stable', 'declining')),
    confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    category VARCHAR(100),
    brand VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ingredient analysis table
CREATE TABLE IF NOT EXISTS ingredient_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ingredient VARCHAR(255) NOT NULL,
    is_problematic BOOLEAN NOT NULL,
    is_hidden BOOLEAN NOT NULL,
    detected_triggers JSONB NOT NULL DEFAULT '[]',
    confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    category VARCHAR(100) NOT NULL,
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('low', 'moderate', 'high', 'severe')),
    recommendations JSONB NOT NULL DEFAULT '{}',
    last_analyzed TIMESTAMP NOT NULL,
    data_source VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    device_info JSONB,
    ip_address INET,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API keys table
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    permissions JSONB DEFAULT '[]',
    last_used TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);
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
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gut_profiles_updated_at BEFORE UPDATE ON gut_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_food_items_updated_at BEFORE UPDATE ON food_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scan_analysis_updated_at BEFORE UPDATE ON scan_analysis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scan_history_updated_at BEFORE UPDATE ON scan_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gut_symptoms_updated_at BEFORE UPDATE ON gut_symptoms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON medications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_safe_foods_updated_at BEFORE UPDATE ON safe_foods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_analytics_data_updated_at BEFORE UPDATE ON analytics_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_food_trends_updated_at BEFORE UPDATE ON food_trends FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ingredient_analysis_updated_at BEFORE UPDATE ON ingredient_analysis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON user_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
