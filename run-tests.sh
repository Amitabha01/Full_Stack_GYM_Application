#!/bin/bash

# Script to run all tests and generate badges

echo "🧪 Running FitLife Gym Test Suite..."
echo "===================================="
echo ""

# Backend Tests
echo "📦 Backend Tests"
echo "----------------"
cd backend
npm test -- --coverage --silent 2>/dev/null
BACKEND_EXIT=$?

if [ $BACKEND_EXIT -eq 0 ]; then
    echo "✅ Backend tests passed"
else
    echo "❌ Backend tests failed"
fi

echo ""

# Frontend Tests
echo "⚛️  Frontend Tests"
echo "-----------------"
cd ../frontend
npm test -- --coverage --silent 2>/dev/null
FRONTEND_EXIT=$?

if [ $FRONTEND_EXIT -eq 0 ]; then
    echo "✅ Frontend tests passed"
else
    echo "❌ Frontend tests failed"
fi

echo ""
echo "===================================="

if [ $BACKEND_EXIT -eq 0 ] && [ $FRONTEND_EXIT -eq 0 ]; then
    echo "✅ All tests passed!"
    exit 0
else
    echo "❌ Some tests failed"
    exit 1
fi
