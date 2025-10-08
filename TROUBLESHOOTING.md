# 🔧 Troubleshooting Checklist

*When something isn't working, use this checklist from easiest to hardest fix*

## **Level 1: Quick Checks (30 seconds)**
1. **Check if services are running**
   - `curl http://localhost:8000/health` (backend)
   - Check iOS simulator is open
   - Check terminal for error messages

2. **Verify basic connectivity**
   - Backend responding: `curl http://localhost:8000/health`
   - Frontend loading in simulator
   - No obvious error messages in logs

3. **Check environment variables**
   - `.env` file exists and readable
   - `MOCK_MODE=false` for real database
   - Supabase credentials present

## **Level 2: Service Restarts (1-2 minutes)**
4. **Restart backend**
   ```bash
   pkill -f "python main.py" && cd python-backend && source venv/bin/activate && python main.py
   ```

5. **Restart iOS simulator**
   - Close simulator
   - `npx expo run:ios`

6. **Clear caches**
   - `npx expo start --clear`
   - Restart Metro bundler

## **Level 3: Configuration Issues (3-5 minutes)**
7. **Check port conflicts**
   - `lsof -ti:8000` (backend port)
   - `lsof -ti:8081` (Metro port)
   - Kill conflicting processes

8. **Verify file paths and imports**
   - Check import paths in code
   - Verify file exists where expected
   - Check for typos in file names

9. **Database connection issues**
   - Verify Supabase project is accessible
   - Check API keys are correct
   - Test with `curl` to Supabase REST API

## **Level 4: Code Issues (5-10 minutes)**
10. **Check syntax errors**
    - Look for TypeScript/JavaScript errors
    - Check Python syntax in backend
    - Verify SQL syntax in database queries

11. **Debug API endpoints**
    - Test with `curl` or Postman
    - Check request/response format
    - Verify authentication headers

12. **Check data flow**
    - Frontend → Backend → Database
    - Verify data types match
    - Check for null/undefined values

## **Level 5: Complex Issues (10+ minutes)**
13. **Environment setup problems**
    - Reinstall dependencies
    - Check Python virtual environment
    - Verify Node.js version compatibility

14. **Database schema issues**
    - Check table structure matches code
    - Verify foreign key relationships
    - Run database migrations

15. **Platform-specific issues**
    - iOS simulator vs device differences
    - Metro bundler configuration
    - Expo SDK version compatibility

## **Level 6: Nuclear Options (Last Resort)**
16. **Full environment reset**
    - Delete `node_modules`, reinstall
    - Recreate Python virtual environment
    - Reset iOS simulator

17. **Database reset**
    - Drop and recreate database schema
    - Reseed with fresh data
    - Check for data corruption

18. **Project reconstruction**
    - Create new Expo project
    - Copy over code files
    - Reconfigure from scratch

---

## 🎯 **Quick Decision Tree:**
- **"It was working before"** → Start with Level 1-2
- **"New feature not working"** → Start with Level 3-4  
- **"Nothing works at all"** → Start with Level 5-6
- **"Intermittent issues"** → Start with Level 2-3

---

## 📝 **Common Commands:**
```bash
# Kill processes on ports
lsof -ti:8000 | xargs kill -9
lsof -ti:8081 | xargs kill -9

# Restart backend
cd python-backend && source venv/bin/activate && python main.py

# Restart frontend
npx expo start --clear

# Test API
curl http://localhost:8000/health
```

---

*Created: October 2025*
*For: PennApps Meetup App*

