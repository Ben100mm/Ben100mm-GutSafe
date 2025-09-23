# Data Visualization Features

This document outlines the comprehensive data visualization system implemented in the GutSafe app, inspired by Apple Health App's beautiful charts and progress indicators.

## 🎯 Features Overview

### 1. Progress Rings (Apple Health Style)
- **Circular progress indicators** similar to Apple Health's activity rings
- **Multiple metrics** displayed simultaneously (Gut Health, Safe Foods, Energy)
- **Animated progress** with smooth transitions
- **Customizable colors** and sizes
- **Goal tracking** with visual progress representation

### 2. Trend Analysis Charts
- **Line charts** showing gut health trends over time
- **Area charts** with gradient fills for visual appeal
- **Interactive tooltips** for detailed data points
- **Multiple time periods** (week, month, quarter, year)
- **Trend indicators** with percentage changes and insights

### 3. Food Trend Analysis
- **Bar charts** showing food scan frequency
- **Trend categorization** (improving, stable, declining)
- **Sorting and filtering** options
- **Detailed food statistics** (safe, caution, avoid counts)
- **Confidence scoring** for trend reliability

### 4. Comprehensive Analytics Screen
- **Dedicated analytics tab** in the main navigation
- **Multiple chart types** in one unified interface
- **Period selection** for different time ranges
- **Insights and recommendations** based on data analysis
- **Refresh functionality** for real-time updates

## 📊 Components

### ProgressRing Component
```typescript
// Single progress ring
<ProgressRing
  data={{
    id: 'gut-health',
    label: 'Gut Health',
    value: 85,
    goal: 90,
    color: Colors.primary,
    unit: 'score'
  }}
  size={120}
  strokeWidth={8}
  animated={true}
/>

// Multiple progress rings
<MultipleProgressRings
  rings={progressRings}
  size={100}
  layout="horizontal"
/>
```

### TrendChart Component
```typescript
<TrendChart
  data={trendAnalysis}
  title="Gut Health Trend"
  subtitle="Your weekly progress"
  color={Colors.primary}
  height={200}
  showTooltip={true}
  showArea={true}
/>
```

### FoodTrendAnalysis Component
```typescript
<FoodTrendAnalysis
  data={foodTrendData}
  maxItems={10}
  showChart={true}
  showInsights={true}
/>
```

## 🔧 Data Types

### GutHealthMetrics
```typescript
interface GutHealthMetrics {
  date: Date;
  overallScore: number; // 0-100
  safeFoodsCount: number;
  cautionFoodsCount: number;
  avoidFoodsCount: number;
  symptomsReported: number; // 0-10 scale
  energyLevel: number; // 0-10 scale
  sleepQuality: number; // 0-10 scale
}
```

### FoodTrendData
```typescript
interface FoodTrendData {
  foodName: string;
  totalScans: number;
  safeCount: number;
  cautionCount: number;
  avoidCount: number;
  lastScanned: Date;
  trend: 'improving' | 'stable' | 'declining';
  confidence: number; // 0-1
}
```

### TrendAnalysis
```typescript
interface TrendAnalysis {
  period: 'week' | 'month' | 'quarter' | 'year';
  trend: 'up' | 'down' | 'stable';
  changePercentage: number;
  dataPoints: ChartDataPoint[];
  insights: string[];
  recommendations: string[];
}
```

## 🎨 Design System

### Colors
- **Primary**: `#0F5257` (Petrol Blue-Teal)
- **Safe**: `#4ADE80` (Safe Green)
- **Caution**: `#FACC15` (Caution Amber)
- **Avoid**: `#F87171` (Avoid Red)
- **Primary Light**: `#56CFE1` (Aqua)

### Chart Styling
- **Apple Health inspired** design language
- **Smooth animations** with 1000ms duration
- **Gradient fills** for area charts
- **Rounded corners** and modern shadows
- **Dark mode support** with adaptive colors

## 📱 Navigation Integration

The analytics features are integrated into the main app navigation:

1. **Dashboard Tab**: Shows progress rings and basic trend chart
2. **Analytics Tab**: Comprehensive analytics screen with all visualizations
3. **Seamless navigation** between different chart types

## 🔄 Data Processing

### AnalyticsUtils Class
The `AnalyticsUtils` class provides:

- **Score calculation** from raw metrics
- **Trend analysis** generation
- **Food trend processing** from scan history
- **Insights generation** based on data patterns
- **Recommendations** for improvement
- **Mock data generation** for testing

### Key Methods:
```typescript
// Calculate overall gut health score
AnalyticsUtils.calculateOverallScore(metrics)

// Generate trend analysis
AnalyticsUtils.generateTrendAnalysis(metrics, 'week')

// Process food trends from scan history
AnalyticsUtils.processFoodTrends(scanHistory)
```

## 🚀 Usage Examples

### Basic Progress Ring
```typescript
const progressRings = [
  {
    id: 'gut-health',
    label: 'Gut Health',
    value: 85,
    goal: 90,
    color: Colors.primary,
    unit: 'score'
  }
];

<MultipleProgressRings rings={progressRings} />
```

### Trend Chart with Data
```typescript
const trendData = {
  period: 'week',
  trend: 'up',
  changePercentage: 12.5,
  dataPoints: [
    { x: 1, y: 75 },
    { x: 2, y: 78 },
    { x: 3, y: 82 }
  ],
  insights: ['Your gut health is improving'],
  recommendations: ['Continue tracking food intake']
};

<TrendChart data={trendData} title="Gut Health Trend" />
```

## 🎯 Key Benefits

1. **Apple Health App Aesthetics**: Beautiful, familiar design language
2. **Comprehensive Analytics**: Multiple chart types for different insights
3. **Interactive Experience**: Tooltips, filtering, and period selection
4. **Data-Driven Insights**: Automated analysis and recommendations
5. **Responsive Design**: Works on all screen sizes
6. **Dark Mode Support**: Adaptive theming
7. **Performance Optimized**: Smooth animations and efficient rendering

## 🔮 Future Enhancements

- **Export functionality** for charts and data
- **Custom date ranges** for trend analysis
- **Advanced filtering** options
- **Comparison charts** between different time periods
- **Predictive analytics** based on historical data
- **Integration with health APIs** for comprehensive tracking

This data visualization system provides users with powerful insights into their gut health journey, making it easy to track progress, identify patterns, and make informed decisions about their dietary choices.
