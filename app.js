// DSA AI Application JavaScript

class DSAApp {
    constructor() {
        this.currentTab = 'dsa';
        this.selectedMode = null;
        this.uploadedFiles = [];
        this.chatMode = 'general';
        this.chatHistory = [];
        this.activePanels = new Set();
        
        this.initializeApp();
    }

    initializeApp() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupApp();
            });
        } else {
            this.setupApp();
        }
    }

    setupApp() {
        this.initializeLucideIcons();
        this.setupEventListeners();
        this.setupPDFUpload();
        this.setupFormValidation();
        this.initializeTooltips();
        console.log('DSA AI Application initialized');
    }

    initializeLucideIcons() {
        // Initialize Lucide icons with error handling
        try {
            if (typeof lucide !== 'undefined' && lucide.createIcons) {
                lucide.createIcons();
            }
        } catch (error) {
            console.warn('Lucide icons failed to initialize:', error);
        }
    }

    setupEventListeners() {
        // Tab navigation with improved error handling
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = e.currentTarget.dataset.tab;
                console.log('Switching to tab:', tabId);
                this.switchTab(tabId);
            });
        });

        // Mode selection for DSA
        document.querySelectorAll('.mode-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const mode = e.currentTarget.dataset.mode;
                console.log('Selected mode:', mode);
                this.selectMode(mode);
            });
        });

        // Generate solution button (inline)
        const generateBtn = document.getElementById('generate-solution');
        if (generateBtn) {
            generateBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Generate solution clicked');
                this.generateSolution();
            });
        }

        // Copy solution button
        const copyBtn = document.getElementById('copy-solution');
        if (copyBtn) {
            copyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.copySolution();
            });
        }

        // Chat mode toggle
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const mode = e.currentTarget.dataset.mode;
                this.switchChatMode(mode);
            });
        });

        // Send message
        const sendBtn = document.getElementById('send-message');
        const chatInput = document.getElementById('chat-input');
        
        if (sendBtn) {
            sendBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.sendMessage();
            });
        }

        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        // Quick questions
        document.querySelectorAll('.quick-question-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const question = e.currentTarget.dataset.question;
                this.askQuickQuestion(question);
            });
        });

        // Panel toggles
        const pdfToggle = document.getElementById('pdf-panel-toggle');
        const toolsToggle = document.getElementById('tools-panel-toggle');

        if (pdfToggle) {
            pdfToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.togglePanel('pdf');
            });
        }

        if (toolsToggle) {
            toolsToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.togglePanel('tools');
            });
        }

        // Analysis tools
        const summaryBtn = document.getElementById('generate-summary');
        const quizBtn = document.getElementById('generate-quiz');
        const conceptsBtn = document.getElementById('extract-concepts');

        if (summaryBtn) {
            summaryBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.generateSummary();
            });
        }

        if (quizBtn) {
            quizBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.generateQuiz();
            });
        }

        if (conceptsBtn) {
            conceptsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.extractConcepts();
            });
        }
    }

    setupFormValidation() {
        // Form validation for generate button state
        const languageSelect = document.getElementById('language-select');
        const problemInput = document.getElementById('problem-input');
        const generateBtn = document.getElementById('generate-solution');

        if (!languageSelect || !problemInput || !generateBtn) {
            console.warn('Form validation elements not found');
            return;
        }

        const validateForm = () => {
            const hasLanguage = languageSelect.value !== '';
            const hasText = problemInput.value.trim() !== '';
            const hasMode = this.selectedMode !== null;

            const isValid = hasLanguage && hasText && hasMode;
            generateBtn.disabled = !isValid;

            console.log('Form validation:', { hasLanguage, hasText, hasMode, isValid });
        };

        // Add event listeners for real-time validation
        languageSelect.addEventListener('change', validateForm);
        problemInput.addEventListener('input', validateForm);

        // Initial validation
        validateForm();

        // Store validation function for mode selection
        this.validateForm = validateForm;
    }

    switchTab(tabId) {
        console.log('Switching tab to:', tabId);
        
        // Update nav tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        const activeTab = document.querySelector(`[data-tab="${tabId}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }

        // Update content visibility
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const activeContent = document.getElementById(`${tabId}-tab`);
        if (activeContent) {
            activeContent.classList.add('active');
            console.log('Tab content activated:', `${tabId}-tab`);
        } else {
            console.error('Tab content not found:', `${tabId}-tab`);
        }

        this.currentTab = tabId;
        
        // Re-initialize icons after tab switch
        setTimeout(() => {
            this.initializeLucideIcons();
        }, 100);
    }

    selectMode(mode) {
        console.log('Selecting mode:', mode);
        
        // Remove previous selection
        document.querySelectorAll('.mode-card').forEach(card => {
            card.classList.remove('selected');
        });

        // Add selection to clicked mode
        const selectedCard = document.querySelector(`[data-mode="${mode}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
            this.selectedMode = mode;
            console.log('Mode selected:', mode);
            
            // Revalidate form
            if (this.validateForm) {
                this.validateForm();
            }
        }
    }

    async generateSolution() {
        console.log('Starting solution generation...');
        
        const problemInput = document.getElementById('problem-input');
        const languageSelect = document.getElementById('language-select');
        const generateBtn = document.getElementById('generate-solution');
        const solutionOutput = document.getElementById('solution-output');
        const solutionContent = document.getElementById('solution-content');

        if (!problemInput || !languageSelect || !generateBtn || !solutionOutput || !solutionContent) {
            console.error('Required elements not found');
            this.showToast('Application error: Missing required elements', 'error');
            return;
        }

        const problemText = problemInput.value.trim();
        const language = languageSelect.value;

        // Validation
        if (!problemText) {
            this.showToast('Please enter a problem statement', 'error');
            problemInput.focus();
            return;
        }

        if (!language) {
            this.showToast('Please select a programming language', 'error');
            languageSelect.focus();
            return;
        }

        if (!this.selectedMode) {
            this.showToast('Please select an explanation mode', 'error');
            return;
        }

        console.log('Generating solution for:', { problemText: problemText.substring(0, 50) + '...', language, mode: this.selectedMode });

        // Show loading state
        generateBtn.classList.add('loading');
        generateBtn.disabled = true;
        
        // Hide solution output during generation
        solutionOutput.classList.add('hidden');

        try {
            // Call Flask backend instead of simulation
const response = await fetch("/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        language: language,
        problem: problemText,
        mode: this.selectedMode
    })
});

if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
}

const data = await response.json();
const solution = data.solution || "No response from Gemini.";


solutionContent.innerHTML = this.formatSolution(solution);
solutionOutput.classList.remove("hidden");

            
        } catch (error) {
            console.error('Solution generation failed:', error);
            this.showToast('Failed to generate solution. Please try again.', 'error');
        } finally {
            // Hide loading state
            generateBtn.classList.remove('loading');
            
            // Re-validate form to restore proper disabled state
            if (this.validateForm) {
                this.validateForm();
            }
        }
    }

    formatSolution(solution) {
        // Convert plain text to HTML with basic formatting
        return solution
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    }

    async simulateAPISolution(problem, language, mode) {
        console.log('Simulating API call for:', { problem: problem.substring(0, 50), language, mode });
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));

        const solutions = {
            brief: `# ${language.toUpperCase()} Solution - Brief Explanation

**Problem:** Two Sum Array Search

\`\`\`${language}
${this.getCodeSample(language, 'brief')}
\`\`\`

**Time Complexity:** O(n) - Single pass through array
**Space Complexity:** O(n) - Hash map storage

**Explanation:** This solution uses a hash map to store numbers and their indices. For each number, we check if its complement (target - current number) exists in the hash map. If found, we return the indices. This optimizes the brute force O(n²) approach to O(n).`,

            depth: `# ${language.toUpperCase()} Solution - Detailed Explanation

**Problem Analysis:** Two Sum Array Search
Given an array of integers and a target sum, find indices of two numbers that add up to the target.

\`\`\`${language}
${this.getCodeSample(language, 'depth')}
\`\`\`

**Detailed Complexity Analysis:**
- **Time Complexity:** O(n) - We traverse the list exactly once
- **Space Complexity:** O(n) - In worst case, we store n-1 elements in hash map

**Algorithm Walkthrough:**
1. **Initialize:** Create empty hash map for number-to-index mapping
2. **Iterate:** Go through each number in the array
3. **Calculate:** Find complement needed (target - current number)
4. **Check:** See if complement exists in our hash map
5. **Return:** If found, return both indices; otherwise continue
6. **Store:** Add current number and index to hash map for future lookups

**Key Insights:**
- Hash table provides O(1) average lookup time
- We trade space for time efficiency
- Single pass algorithm is optimal for this problem
- Each number is visited exactly once

**Example Execution:**
Array: [2, 7, 11, 15], Target: 9
- i=0, num=2, complement=7, not in dict, store {2: 0}
- i=1, num=7, complement=2, found in dict at index 0, return [0, 1]`,

            pro: `# ${language.toUpperCase()} Solution - Pro Mode Analysis

**Problem:** Two Sum - Find indices of two numbers that sum to target

## Approach Evolution

### 1. Brute Force Approach (Naive)
\`\`\`${language}
${this.getCodeSample(language, 'brute')}
\`\`\`
**Time:** O(n²) **Space:** O(1)
**Problem:** Too slow for large inputs - checks every possible pair

### 2. Hash Table Approach (Optimized)
\`\`\`${language}
${this.getCodeSample(language, 'optimized')}
\`\`\`
**Time:** O(n) **Space:** O(n)

## Optimization Journey
1. **Identify Bottleneck:** Nested loop in brute force creates O(n²) time
2. **Key Insight:** Instead of checking every pair, use complement lookup
3. **Data Structure Choice:** Hash table for O(1) average lookup
4. **Single Pass:** Build hash table and search simultaneously

## Trade-off Analysis
| Approach | Time | Space | Pros | Cons |
|----------|------|-------|------|------|
| Brute Force | O(n²) | O(1) | Simple, no extra space | Too slow |
| Hash Table | O(n) | O(n) | Fast, single pass | Uses extra space |
| Two Pointers* | O(n log n) | O(1) | Space efficient | Requires sorting, loses original indices |

*Two pointers works if we don't need original indices

## Edge Cases Handled
- Empty array: Returns []
- No solution exists: Returns []
- Duplicate numbers: Works correctly
- Negative numbers: Hash table handles all integers
- Target is zero: Works with negative complements

## Interview Communication Strategy
1. **Start Simple:** "Let me begin with brute force to ensure correctness"
2. **Identify Issues:** "This O(n²) approach will be too slow for large inputs"
3. **Propose Optimization:** "I can use a hash table to get O(n) time"
4. **Explain Trade-off:** "Trading O(n) space for O(n) time improvement"
5. **Code Clean Solution:** Write optimized version with clear variable names
6. **Test Edge Cases:** Walk through examples including edge cases

## Production Considerations
- **Hash Collision:** ${language} dict/HashMap has good collision handling
- **Integer Overflow:** ${language === 'python' ? 'Not an issue in Python' : 'Consider in ' + language}
- **Memory Usage:** O(n) space is acceptable for most real-world scenarios
- **Concurrent Access:** Hash table modifications not thread-safe

This demonstrates systematic problem-solving: understanding → brute force → optimization → analysis.`
        };

        return solutions[mode] || solutions.brief;
    }

    getCodeSample(language, type) {
        const samples = {
            python: {
                brief: `def two_sum(nums, target):
    num_dict = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in num_dict:
            return [num_dict[complement], i]
        num_dict[num] = i
    return []`,
                depth: `def two_sum(nums, target):
    # Create a dictionary to store number -> index mapping
    num_dict = {}
    
    # Iterate through the array with both index and value
    for i, num in enumerate(nums):
        # Calculate what number we need to reach the target
        complement = target - num
        
        # Check if the complement exists in our dictionary
        if complement in num_dict:
            # Return the indices: stored index and current index
            return [num_dict[complement], i]
        
        # Store current number and its index for future lookups
        num_dict[num] = i
    
    # Return empty list if no solution found
    return []`,
                brute: `def two_sum_brute_force(nums, target):
    n = len(nums)
    for i in range(n):
        for j in range(i + 1, n):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []`,
                optimized: `def two_sum_optimized(nums, target):
    num_dict = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in num_dict:
            return [num_dict[complement], i]
        num_dict[num] = i
    return []`
            },
            java: {
                brief: `public int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> numMap = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
        if (numMap.containsKey(complement)) {
            return new int[]{numMap.get(complement), i};
        }
        numMap.put(nums[i], i);
    }
    return new int[]{};
}`,
                depth: `public int[] twoSum(int[] nums, int target) {
    // Create HashMap to store number -> index mapping
    Map<Integer, Integer> numMap = new HashMap<>();
    
    // Iterate through array with index
    for (int i = 0; i < nums.length; i++) {
        // Calculate complement needed
        int complement = target - nums[i];
        
        // Check if complement exists in our map
        if (numMap.containsKey(complement)) {
            // Return indices: stored index and current index
            return new int[]{numMap.get(complement), i};
        }
        
        // Store current number and its index
        numMap.put(nums[i], i);
    }
    
    // Return empty array if no solution found
    return new int[]{};
}`,
                brute: `public int[] twoSumBruteForce(int[] nums, int target) {
    int n = nums.length;
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (nums[i] + nums[j] == target) {
                return new int[]{i, j};
            }
        }
    }
    return new int[]{};
}`,
                optimized: `public int[] twoSumOptimized(int[] nums, int target) {
    Map<Integer, Integer> numMap = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
        if (numMap.containsKey(complement)) {
            return new int[]{numMap.get(complement), i};
        }
        numMap.put(nums[i], i);
    }
    return new int[]{};
}`
            }
        };

        return samples[language]?.[type] || samples.python[type] || samples.python.brief;
    }

    copySolution() {
        const solutionContent = document.getElementById('solution-content');
        if (!solutionContent) {
            this.showToast('No solution to copy', 'error');
            return;
        }
        
        const text = solutionContent.textContent || solutionContent.innerText;
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                this.showToast('Solution copied to clipboard!', 'success');
            }).catch(() => {
                this.fallbackCopy(text);
            });
        } else {
            this.fallbackCopy(text);
        }
    }

    fallbackCopy(text) {
        // Fallback copy method for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            this.showToast('Solution copied to clipboard!', 'success');
        } catch (err) {
            this.showToast('Failed to copy solution', 'error');
        }
        document.body.removeChild(textArea);
    }

    switchChatMode(mode) {
        console.log('Switching chat mode to:', mode);
        
        // Update toggle buttons
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-mode="${mode}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        this.chatMode = mode;
        this.updateAnalysisToolsState();
        
        // Update placeholder text
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.placeholder = mode === 'pdf' 
                ? 'Ask questions about your uploaded PDFs...'
                : 'Ask me anything about programming...';
        }
    }

    togglePanel(panelType) {
        const toggleBtn = document.getElementById(`${panelType}-panel-toggle`);
        const panel = document.getElementById(`${panelType}-panel`);
        
        if (!toggleBtn || !panel) {
            console.warn(`Panel elements not found: ${panelType}`);
            return;
        }

        const isActive = this.activePanels.has(panelType);
        
        if (isActive) {
            // Close panel
            this.activePanels.delete(panelType);
            toggleBtn.classList.remove('active');
            panel.classList.add('hidden');
        } else {
            // Open panel
            this.activePanels.add(panelType);
            toggleBtn.classList.add('active');
            panel.classList.remove('hidden');
        }

        console.log('Toggle panel:', panelType, isActive ? 'closed' : 'opened');
    }

    setupPDFUpload() {
        const uploadArea = document.getElementById('pdf-upload');
        const fileInput = uploadArea?.querySelector('.file-input');

        if (!uploadArea || !fileInput) {
            console.warn('PDF upload elements not found');
            return;
        }

        // Click to upload
        uploadArea.addEventListener('click', (e) => {
            if (e.target === fileInput) return; // Prevent double trigger
            fileInput.click();
        });

        // File selection
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFiles(e.target.files);
            }
        });

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            this.handleFiles(e.dataTransfer.files);
        });
    }

    handleFiles(files) {
        console.log('Handling files:', files.length);
        const pdfFiles = Array.from(files).filter(file => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));
        
        if (pdfFiles.length === 0) {
            this.showToast('Please upload only PDF files', 'error');
            return;
        }

        let newFiles = 0;
        pdfFiles.forEach(file => {
            if (!this.uploadedFiles.some(f => f.name === file.name && f.size === file.size)) {
                this.uploadedFiles.push(file);
                newFiles++;
            }
        });

        this.updateFileList();
        this.updateAnalysisToolsState();
        
        if (newFiles > 0) {
            this.showToast(`${newFiles} file(s) uploaded successfully`, 'success');
        } else {
            this.showToast('Files already uploaded', 'error');
        }
    }

    updateFileList() {
        const uploadedFilesContainer = document.getElementById('uploaded-files');
        const fileList = document.getElementById('file-list');

        if (!uploadedFilesContainer || !fileList) {
            console.warn('File list elements not found');
            return;
        }

        if (this.uploadedFiles.length === 0) {
            uploadedFilesContainer.classList.add('hidden');
            return;
        }

        uploadedFilesContainer.classList.remove('hidden');
        fileList.innerHTML = '';

        this.uploadedFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <i data-lucide="file-text"></i>
                <span class="file-name" title="${file.name}">${file.name}</span>
                <i data-lucide="x" class="file-remove" data-index="${index}"></i>
            `;

            fileList.appendChild(fileItem);

            // Add remove functionality
            const removeBtn = fileItem.querySelector('.file-remove');
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeFile(index);
            });
        });

        // Re-initialize icons
        this.initializeLucideIcons();
    }

    removeFile(index) {
        if (index >= 0 && index < this.uploadedFiles.length) {
            const fileName = this.uploadedFiles[index].name;
            this.uploadedFiles.splice(index, 1);
            this.updateFileList();
            this.updateAnalysisToolsState();
            this.showToast(`${fileName} removed`, 'success');
        }
    }

    updateAnalysisToolsState() {
        const toolButtons = document.querySelectorAll('.tool-btn');
        const hasFiles = this.uploadedFiles.length > 0;

        toolButtons.forEach(btn => {
            btn.disabled = !hasFiles;
            if (hasFiles) {
                btn.classList.remove('disabled');
            } else {
                btn.classList.add('disabled');
            }
        });
    }

    async sendMessage() {
        const chatInput = document.getElementById('chat-input');
        if (!chatInput) return;
        
        const message = chatInput.value.trim();
        if (!message) return;

        console.log('Sending message:', message);

        // Add user message
        this.addMessage(message, 'user');
        chatInput.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Simulate AI response
            const response = await this.getAIResponse(message);
            this.hideTypingIndicator();
            this.addMessage(response, 'ai');
        } catch (error) {
            console.error('Error getting AI response:', error);
            this.hideTypingIndicator();
            this.addMessage('Sorry, I encountered an error. Please try again.', 'ai');
        }
    }

    addMessage(content, type) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        const avatar = type === 'user' 
            ? '<i data-lucide="user"></i>'
            : '<i data-lucide="bot"></i>';
        
        messageDiv.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">${this.formatMessage(content)}</div>
        `;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Re-initialize icons
        this.initializeLucideIcons();
    }

    formatMessage(content) {
        // Format message content with basic HTML
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    showTypingIndicator() {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-avatar"><i data-lucide="bot"></i></div>
            <div class="message-content">Thinking...</div>
        `;
        
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        this.initializeLucideIcons();
    }

    hideTypingIndicator() {
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    async getAIResponse(message) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const lowerMessage = message.toLowerCase();
    
    // Specific responses for common questions
    const responses = {
        'what is the difference between arraylist and linkedlist in java?': 'ArrayList and LinkedList are both implementations of the List interface in Java, but they have different performance characteristics:\n\n**ArrayList:**\n• Uses dynamic array internally\n• O(1) random access by index\n• O(n) insertion/deletion in middle\n• Better for frequent access operations\n• Less memory overhead per element\n\n**LinkedList:**\n• Uses doubly-linked list internally\n• O(n) random access by index\n• O(1) insertion/deletion at known positions\n• Better for frequent insertions/deletions\n• More memory overhead (stores pointers)\n\n**Use ArrayList when:** You need frequent random access\n**Use LinkedList when:** You need frequent insertions/deletions',
        'explain how binary search works with an example': 'Binary Search is a divide-and-conquer algorithm that finds a target value in a **sorted array**:\n\n**Algorithm Steps:**\n1. Start with left = 0, right = array.length - 1\n2. Calculate middle index: mid = (left + right) / 2\n3. Compare target with array[mid]:\n   • If equal: Found! Return mid\n   • If target < array[mid]: Search left half (right = mid - 1)\n   • If target > array[mid]: Search right half (left = mid + 1)\n4. Repeat until found or left > right\n\n**Example:** Find 7 in [1, 3, 5, 7, 9, 11, 13]\n• Step 1: left=0, right=6, mid=3, array[3]=7 ✓ Found!\n\n**Time Complexity:** O(log n)\n**Space Complexity:** O(1) iterative, O(log n) recursive\n\n**Key Requirement:** Array must be sorted!',
        'what are the time complexities of common sorting algorithms?': 'Here are the time complexities of common sorting algorithms:\n\n| Algorithm | Best Case | Average Case | Worst Case | Space | Stable |\n|-----------|-----------|--------------|------------|-------|---------|\n| **Bubble Sort** | O(n) | O(n²) | O(n²) | O(1) | Yes |\n| **Selection Sort** | O(n²) | O(n²) | O(n²) | O(1) | No |\n| **Insertion Sort** | O(n) | O(n²) | O(n²) | O(1) | Yes |\n| **Merge Sort** | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes |\n| **Quick Sort** | O(n log n) | O(n log n) | O(n²) | O(log n) | No |\n| **Heap Sort** | O(n log n) | O(n log n) | O(n log n) | O(1) | No |\n| **Counting Sort** | O(n+k) | O(n+k) | O(n+k) | O(k) | Yes |\n| **Radix Sort** | O(d×(n+k)) | O(d×(n+k)) | O(d×(n+k)) | O(n+k) | Yes |\n\n**Quick recommendations:**\n• **General purpose:** Merge Sort (guaranteed O(n log n))\n• **In-place:** Heap Sort\n• **Small arrays:** Insertion Sort\n• **Nearly sorted:** Insertion Sort',
        'how do you implement a hash table from scratch?': 'Here\'s how to implement a basic hash table from scratch:\n\n**Core Components:**\n1. **Hash Function:** Maps keys to array indices\n2. **Bucket Array:** Stores key-value pairs\n3. **Collision Resolution:** Handles multiple keys mapping to same index\n\n**Basic Implementation (Python):**\n``````\n\n**Key Design Decisions:**\n• **Collision Resolution:** Chaining vs Open Addressing\n• **Load Factor:** Resize when > 0.7 for good performance\n• **Hash Function:** Good distribution, fast computation'
    };

    // Check for exact matches first
    for (const [key, response] of Object.entries(responses)) {
        if (lowerMessage === key.toLowerCase()) {
            return response;
        }
    }

    // Context-specific responses
    if (this.chatMode === 'pdf' && this.uploadedFiles.length === 0) {
        return 'Please upload a PDF file first to ask questions about specific documents. You can drag and drop files or click the upload area in the PDF Analysis panel below.';
    }

    if (this.chatMode === 'pdf' && this.uploadedFiles.length > 0) {
        return `I can help you analyze your uploaded PDF files (${this.uploadedFiles.length} file${this.uploadedFiles.length > 1 ? 's' : ''}). I can answer questions about the content, generate summaries, or create practice quizzes. What specific aspect would you like me to help with?`;
    }

    // General programming responses
    try {
        // Call Flask backend instead of simulation
        const response = await fetch("/question_ans", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question: message })
        });

        // It's good practice to await and extract the JSON here before returning
        const data = await response.json();
        return data.answer || "I'm sorry, I couldn't find an answer.";
    } catch (error) {
        // Catch block added here
        console.error("Error fetching AI response:", error);
        return "Sorry, I encountered an error while processing your request. Please try again.";
    }
}


    askQuickQuestion(question) {
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.value = question;
            this.sendMessage();
        }
    }

    async generateSummary() {
        if (this.uploadedFiles.length === 0) {
            this.showToast('Please upload PDF files first', 'error');
            return;
        }

        this.addMessage('Generate a summary of my uploaded documents', 'user');
        this.showTypingIndicator();

        await new Promise(resolve => setTimeout(resolve, 2000));
        this.hideTypingIndicator();

        const fileNames = this.uploadedFiles.map(f => f.name).join(', ');
        const summary = `📄 **Document Summary**\n\nBased on your uploaded PDF files (${this.uploadedFiles.length} document${this.uploadedFiles.length > 1 ? 's' : ''}):\n**Files:** ${fileNames}\n\n**Key Topics Covered:**\n• Data Structures and Algorithms fundamentals\n• Time and space complexity analysis\n• Common algorithmic patterns and techniques\n• Problem-solving methodologies\n\n**Main Concepts:**\n• Array and string manipulation\n• Tree and graph algorithms\n• Dynamic programming approaches\n• Sorting and searching techniques\n\n**Difficulty Level:** Intermediate to Advanced\n**Estimated Study Time:** 2-3 hours\n\nWould you like me to elaborate on any specific topic or generate practice questions?`;

        this.addMessage(summary, 'ai');
    }

    async generateQuiz() {
        if (this.uploadedFiles.length === 0) {
            this.showToast('Please upload PDF files first', 'error');
            return;
        }

        this.addMessage('Generate a quiz from my documents', 'user');
        this.showTypingIndicator();

        await new Promise(resolve => setTimeout(resolve, 2500));
        this.hideTypingIndicator();

        const quiz = `📝 **Generated Quiz**\n\nBased on your uploaded documents:\n\n**Question 1:** What is the time complexity of binary search?\na) O(n)  b) O(log n)  c) O(n²)  d) O(1)\n\n**Question 2:** Which data structure uses LIFO principle?\na) Queue  b) Array  c) Stack  d) Linked List\n\n**Question 3:** What is the main advantage of dynamic programming?\na) Faster execution  b) Less memory usage  c) Avoiding redundant calculations  d) Simpler code\n\n**Question 4:** In merge sort, what is the space complexity?\na) O(1)  b) O(log n)  c) O(n)  d) O(n log n)\n\n**Question 5:** Which algorithm is best for finding shortest path in unweighted graphs?\na) DFS  b) BFS  c) Dijkstra  d) Bellman-Ford\n\n**Answers:** 1-b, 2-c, 3-c, 4-c, 5-b\n\nWould you like explanations for any of these questions?`;

        this.addMessage(quiz, 'ai');
    }

    async extractConcepts() {
        if (this.uploadedFiles.length === 0) {
            this.showToast('Please upload PDF files first', 'error');
            return;
        }

        this.addMessage('Extract key concepts from my documents', 'user');
        this.showTypingIndicator();

        await new Promise(resolve => setTimeout(resolve, 2000));
        this.hideTypingIndicator();

        const concepts = `🔍 **Key Concepts Extracted**\n\nFrom your uploaded documents:\n\n**Data Structures:**\n• Arrays, Linked Lists, Stacks, Queues\n• Trees (Binary, BST, AVL, Heap)\n• Hash Tables, Graphs\n• Tries, Segment Trees\n\n**Algorithms:**\n• Sorting (Quick, Merge, Heap)\n• Searching (Binary, Linear)\n• Graph Traversal (BFS, DFS)\n• Dynamic Programming\n• Greedy Algorithms\n\n**Complexity Analysis:**\n• Big O Notation\n• Time vs Space Trade-offs\n• Amortized Analysis\n• Best/Average/Worst Case\n\n**Problem-Solving Patterns:**\n• Two Pointers\n• Sliding Window\n• Divide and Conquer\n• Backtracking\n• Memoization\n\n**Important Terms:**\n• Recursion, Iteration\n• Optimal Substructure\n• Overlapping Subproblems\n• In-place algorithms\n\nThese concepts form the foundation of efficient algorithm design and analysis.`;

        this.addMessage(concepts, 'ai');
    }

    showToast(message, type = 'success') {
        console.log('Showing toast:', message, type);
        
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            console.warn('Toast container not found');
            return;
        }
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'check-circle' : 'alert-circle';
        toast.innerHTML = `
            <i data-lucide="${icon}"></i>
            <span class="toast-message">${message}</span>
        `;

        toastContainer.appendChild(toast);
        this.initializeLucideIcons();

        // Auto remove after 4 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 4000);
    }

    initializeTooltips() {
        // Initialize any tooltips or additional UI enhancements
        console.log('DSA AI Application initialized successfully');
        
        // Ensure all icons are loaded
        setTimeout(() => {
            this.initializeLucideIcons();
        }, 500);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.dsaApp = new DSAApp();
});

// Also initialize if DOM is already loaded
if (document.readyState !== 'loading') {
    window.dsaApp = new DSAApp();
}