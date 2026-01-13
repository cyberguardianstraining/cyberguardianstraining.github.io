class PasswordCracker {
    constructor(id) {
        this.id = id;
        this.baseCharset = 'abcdefghijklmnopqrstuvwxyz';
        this.uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        this.numbers = '0123456789';
        this.symbols = '!@#$%^&*()-_=+[]{}|;:,.<>?';
        this.charset = this.baseCharset;
        this.currentAttempt = 'a';
        this.totalAttempts = 0;
        this.visibleMilestones = 12; // Number currently visible
        this.maxMilestones = 16; // Maximum we'll allow

        this.elements = {
            currentAttemptDisplay: document.getElementById(`current-attempt-${id}`),
            milestonesContainer: document.getElementById(`milestones-${id}`),
            uppercaseCheck: document.getElementById(`uppercase-check-${id}`),
            numbersCheck: document.getElementById(`numbers-check-${id}`),
            symbolsCheck: document.getElementById(`symbols-check-${id}`),
            expandBtn: document.getElementById(`expand-btn-${id}`),
            speedDisclaimer: document.getElementById(`speed-disclaimer-${id}`)
        };

        // Set fixed character sets based on panel
        if (this.id === 1) {
            // Panel 1: lowercase only
            this.charset = this.baseCharset;
        } else {
            // Panel 2: all character types
            this.charset = this.baseCharset + this.uppercase + this.numbers + this.symbols;
            this.charset = this.charset.split('').sort().join('');
        }

        this.currentAttempt = this.charset[0];
        this.elements.currentAttemptDisplay.textContent = this.currentAttempt;
    }

    attachEventListeners() {
        // Character set controls are now disabled/hidden
    }

    updateCharset() {
        // Character sets are now fixed per panel in constructor
        // Panel 1: lowercase only
        // Panel 2: all character types
    }

    getNextPassword(current) {
        const chars = current.split('');
        let i = chars.length - 1;

        while (i >= 0) {
            const currentChar = chars[i];
            const currentIndex = this.charset.indexOf(currentChar);

            if (currentIndex < this.charset.length - 1) {
                chars[i] = this.charset[currentIndex + 1];
                return chars.join('');
            } else {
                chars[i] = this.charset[0];
                i--;
            }
        }

        return this.charset[0] + current;
    }

    advance(count) {
        this.totalAttempts += count;
        this.currentAttempt = this.getPasswordAtPosition(this.totalAttempts);
    }

    getPasswordAtPosition(position) {
        if (position === 0) return this.charset[0];

        // Convert position to password
        let remaining = position;
        let result = '';
        let base = this.charset.length;

        // Determine the length of the password
        let length = 1;
        let rangeStart = 0;
        let rangeSize = base;

        while (remaining >= rangeSize) {
            remaining -= rangeSize;
            rangeStart += rangeSize;
            length++;
            rangeSize = Math.pow(base, length);
        }

        // Convert the remaining position to the actual password
        for (let i = 0; i < length; i++) {
            let digitValue = remaining % base;
            result = this.charset[digitValue] + result;
            remaining = Math.floor(remaining / base);
        }

        return result;
    }

    getPositionsForLength(length) {
        // Returns the starting position for passwords of given length
        let base = this.charset.length;
        let position = 0;
        for (let i = 1; i < length; i++) {
            position += Math.pow(base, i);
        }
        return position;
    }

    getTotalPasswordsOfLength(length) {
        return Math.pow(this.charset.length, length);
    }

    formatTimeEstimate(seconds) {
        if (seconds < 60) {
            const s = Math.ceil(seconds);
            return `${s} second${s !== 1 ? 's' : ''}`;
        } else if (seconds < 3600) {
            const minutes = Math.ceil(seconds / 60);
            return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
        } else if (seconds < 86400) {
            const hours = Math.ceil(seconds / 3600);
            return `${hours} hour${hours !== 1 ? 's' : ''}`;
        } else if (seconds < 2592000) { // 30 days
            const days = Math.ceil(seconds / 86400);
            return `${days} day${days !== 1 ? 's' : ''}`;
        } else if (seconds < 31536000) { // 365 days
            const months = Math.ceil(seconds / 2592000);
            return `${months} month${months !== 1 ? 's' : ''}`;
        } else if (seconds < 3153600000) { // 100 years
            const years = Math.ceil(seconds / 31536000);
            return `${years} year${years !== 1 ? 's' : ''}`;
        } else if (seconds < 31536000000) { // 1000 years
            const centuries = Math.ceil(seconds / 3153600000);
            return `${centuries} ${centuries !== 1 ? 'centuries' : 'century'}`;
        } else if (seconds < 31536000000000) { // 1 million years
            const millennia = Math.ceil(seconds / 31536000000);
            return `${millennia} ${millennia !== 1 ? 'millennia' : 'millennium'}`;
        } else {
            const millions = Math.ceil(seconds / 31536000000000);
            return `${millions} million year${millions !== 1 ? 's' : ''}`;
        }
    }

    getTimeToReachLength(length, attemptsPerSecond) {
        const startPos = this.getPositionsForLength(length);
        const endPos = startPos + this.getTotalPasswordsOfLength(length);
        const attemptsRemaining = endPos - this.totalAttempts;
        return attemptsRemaining / attemptsPerSecond;
    }

    getTimeRemainingAtCurrentLength(attemptsPerSecond) {
        const currentLength = this.currentAttempt.length;
        const startPos = this.getPositionsForLength(currentLength);
        const endPos = startPos + this.getTotalPasswordsOfLength(currentLength);
        const attemptsRemaining = endPos - this.totalAttempts;
        return attemptsRemaining / attemptsPerSecond;
    }

    updateMilestones(attemptsPerSecond, showEstimates) {
        const currentLength = this.currentAttempt.length;
        const items = this.elements.milestonesContainer.querySelectorAll('.milestone-item');

        // Check if we need to add more milestones (auto-expand if we reach the current visible limit)
        if (currentLength > this.visibleMilestones && this.visibleMilestones < this.maxMilestones) {
            this.addMilestone(currentLength);
            this.visibleMilestones = currentLength;
        }

        items.forEach((item, index) => {
            const length = index + 1;
            const statusDiv = item.querySelector('.milestone-status');

            if (length < currentLength) {
                // Completed
                statusDiv.innerHTML = '<span class="milestone-check">✓</span>';
            } else if (length === currentLength) {
                // In progress - show progress bar
                const startPos = this.getPositionsForLength(length);
                const totalAtLength = this.getTotalPasswordsOfLength(length);
                const progressAtLength = this.totalAttempts - startPos;
                const percentage = (progressAtLength / totalAtLength) * 100;

                let progressHTML = `
                    <div class="progress-bar-mini">
                        <div class="progress-bar-mini-fill" style="width: ${percentage}%"></div>
                    </div>
                `;

                if (showEstimates) {
                    const timeRemaining = this.getTimeRemainingAtCurrentLength(attemptsPerSecond);
                    const timeEstimate = this.formatTimeEstimate(timeRemaining);
                    progressHTML += `<span style="color: #000; font-size: 16px; margin-left: 8px; font-weight: 300;">${timeEstimate} left</span>`;
                }

                statusDiv.innerHTML = progressHTML;
            } else {
                // Not reached yet - show time estimate if enabled
                if (showEstimates) {
                    const timeInSeconds = this.getTimeToReachLength(length, attemptsPerSecond);
                    const timeEstimate = this.formatTimeEstimate(timeInSeconds);
                    statusDiv.innerHTML = `<span style="color: #000; font-size: 16px; font-weight: 300;">${timeEstimate} left</span>`;
                } else {
                    statusDiv.textContent = '-';
                }
            }
        });
    }

    addMilestone(length) {
        const label = length === 1 ? '1 character' : `${length} characters`;
        const item = document.createElement('div');
        item.className = 'milestone-item';
        item.innerHTML = `
            <div class="milestone-label">${label}</div>
            <div class="milestone-status">-</div>
        `;
        this.elements.milestonesContainer.appendChild(item);
    }

    showMoreMilestones() {
        const newVisible = Math.min(this.visibleMilestones + 4, this.maxMilestones);
        for (let i = this.visibleMilestones + 1; i <= newVisible; i++) {
            this.addMilestone(i);
        }
        this.visibleMilestones = newVisible;
        return this.visibleMilestones < this.maxMilestones; // Return true if more can be shown
    }

    showExpandButton() {
        if (this.visibleMilestones < this.maxMilestones) {
            this.elements.expandBtn.style.display = 'block';
        }
    }

    hideExpandButton() {
        this.elements.expandBtn.style.display = 'none';
    }

    collapseMilestones() {
        // Remove milestone items beyond the 12th
        const items = this.elements.milestonesContainer.querySelectorAll('.milestone-item');
        items.forEach((item, index) => {
            if (index >= 12) {
                item.remove();
            }
        });
        this.visibleMilestones = 12;
        this.hideExpandButton();
    }

    updateDisplay(attemptsPerSecond, showEstimates) {
        this.elements.currentAttemptDisplay.textContent = this.currentAttempt;
        this.updateMilestones(attemptsPerSecond, showEstimates);
        this.updateSpeedDisclaimer(attemptsPerSecond);
    }

    updateSpeedDisclaimer(attemptsPerSecond) {
        const formattedSpeed = attemptsPerSecond.toLocaleString();
        this.elements.speedDisclaimer.textContent = `Estimates based on current speed of ${formattedSpeed} guesses/second`;
    }

    reset() {
        this.currentAttempt = this.charset[0];
        this.totalAttempts = 0;
        this.elements.currentAttemptDisplay.textContent = this.currentAttempt;

        // Reset all milestones to dash
        const items = this.elements.milestonesContainer.querySelectorAll('.milestone-item');
        items.forEach(item => {
            const statusDiv = item.querySelector('.milestone-status');
            statusDiv.textContent = '-';
        });
    }

    setCheckboxesEnabled(enabled) {
        // No checkboxes to enable/disable - character sets are fixed
    }
}

class BruteForceVisualizer {
    constructor() {
        this.cracker1 = new PasswordCracker(1);
        this.cracker2 = new PasswordCracker(2);
        this.attemptsPerSecond = 1000;
        this.startTime = null;
        this.running = false;
        this.intervalId = null;
        this.updateRate = 10; // Visual updates per second
        this.hasStarted = false; // Track if we've started at least once

        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.elements = {
            startBtn: document.getElementById('start-btn'),
            stopBtn: document.getElementById('stop-btn'),
            resetBtn: document.getElementById('reset-btn'),
            speedBtns: document.querySelectorAll('.speed-btn')
        };
    }

    attachEventListeners() {
        this.elements.startBtn.addEventListener('click', () => this.start());
        this.elements.stopBtn.addEventListener('click', () => this.stop());
        this.elements.resetBtn.addEventListener('click', () => this.reset());

        this.elements.speedBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.elements.speedBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.attemptsPerSecond = parseInt(btn.dataset.speed);
                // Update disclaimers immediately when speed changes
                this.cracker1.updateSpeedDisclaimer(this.attemptsPerSecond);
                this.cracker2.updateSpeedDisclaimer(this.attemptsPerSecond);
            });
        });

        // Both expand buttons expand both panels
        this.cracker1.elements.expandBtn.addEventListener('click', () => {
            this.expandMilestones();
        });

        this.cracker2.elements.expandBtn.addEventListener('click', () => {
            this.expandMilestones();
        });
    }

    expandMilestones() {
        this.cracker1.showMoreMilestones();
        const canShowMore = this.cracker2.showMoreMilestones();

        // Hide buttons if we've reached the max
        if (!canShowMore) {
            this.cracker1.hideExpandButton();
            this.cracker2.hideExpandButton();
        }
    }

    start() {
        this.running = true;
        this.startTime = Date.now();
        this.elements.startBtn.disabled = true;
        this.elements.stopBtn.disabled = false;
        this.cracker1.setCheckboxesEnabled(false);
        this.cracker2.setCheckboxesEnabled(false);
        this.hasStarted = true; // Track that we've started at least once

        this.intervalId = setInterval(() => this.update(), 1000 / this.updateRate);
    }

    stop() {
        this.running = false;
        clearInterval(this.intervalId);
        this.elements.startBtn.disabled = false;
        this.elements.stopBtn.disabled = true;
        // Don't re-enable checkboxes - they stay disabled until reset
    }

    reset() {
        this.stop();
        this.startTime = null;
        this.cracker1.reset();
        this.cracker2.reset();
        this.cracker1.collapseMilestones();
        this.cracker2.collapseMilestones();
        this.hasStarted = false;
        this.cracker1.setCheckboxesEnabled(true);
        this.cracker2.setCheckboxesEnabled(true);
    }

    update() {
        if (!this.running) return;

        // Calculate how many attempts should have happened since last update
        const attemptsThisFrame = this.attemptsPerSecond / this.updateRate;

        this.cracker1.advance(attemptsThisFrame);
        this.cracker2.advance(attemptsThisFrame);

        // Show estimates from the start
        const showEstimates = true;

        this.cracker1.updateDisplay(this.attemptsPerSecond, showEstimates);
        this.cracker2.updateDisplay(this.attemptsPerSecond, showEstimates);

        // Show expand buttons when estimates appear and if more can be shown
        if (showEstimates) {
            if (this.cracker1.visibleMilestones < this.cracker1.maxMilestones) {
                this.cracker1.showExpandButton();
                this.cracker2.showExpandButton();
            }
        }
    }
}

// Initialize the visualizer
const visualizer = new BruteForceVisualizer();
