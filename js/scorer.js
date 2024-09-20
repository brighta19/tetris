class Scorer {
    static Points = {
        // reference: https://tetris.fandom.com/wiki/Scoring#Guideline_scoring_system
        SOFT_DROP: 1,
        HARD_DROP_MULTIPLIER: 2,
        SINGLE: 100,
        DOUBLE: 300,
        TRIPLE: 500,
        TETRIS: 800,            // BACK TO BACK
        MINI_TSPIN: 100,
        MINI_TSPIN_SINGLE: 200, // BACK TO BACK
        MINI_TSPIN_DOUBLE: 400, // BACK TO BACK
        TSPIN: 400,
        TSPIN_SINGLE: 800,      // BACK TO BACK
        TSPIN_DOUBLE: 1200,     // BACK TO BACK
        TSPIN_TRIPLE: 1600,     // BACK TO BACK

        BACK_TO_BACK_MULTIPLIER: 1.5,
        COMBO_BONUS: 50,
    };

    constructor(game) {
        this.game = game;
        this.score = 0;
        this.comboLength = -1;
        this.backToBack = false;
    }

    calculateScore(linesCleared, tSpin) {
        if (tSpin == Tetromino.TSpins.MINI) {
            // T-Spin Mini
            if (linesCleared == 0) {
                this.comboLength = -1;
                this.score += Scorer.Points.MINI_TSPIN;
                console.log("T-Spin Mini");
            }
            // T-Spin Mini Single
            else if (linesCleared == 1) {
                this.comboLength++;
                this.score += Scorer.Points.MINI_TSPIN_SINGLE * this.getScoreMultiplier() + this.calculateComboBonus();
                console.log((this.backToBack ? "Back to back " : "") + "T-Spin Mini Single" + (this.comboLength > 0 ? " + COMBO x " + this.comboLength : ""));
                this.backToBack = true;
            }
            // T-Spin Mini Double
            else if (linesCleared == 2) {
                this.comboLength++;
                this.score += Scorer.Points.MINI_TSPIN_DOUBLE * this.getScoreMultiplier() + this.calculateComboBonus();
                console.log((this.backToBack ? "Back to back " : "") + "T-Spin Mini Double" + (this.comboLength > 0 ? " + COMBO x " + this.comboLength : ""));
                this.backToBack = true;
            }
        }
        else if (tSpin == Tetromino.TSpins.REGULAR) {
            // T-Spin
            if (linesCleared == 0) {
                this.comboLength = -1;
                this.score += Scorer.Points.TSPIN;
                console.log("T-Spin");
            }
            // T-Spin Single
            else if (linesCleared == 1) {
                this.comboLength++;
                this.score += Scorer.Points.TSPIN_SINGLE * this.getScoreMultiplier() + this.calculateComboBonus();
                console.log((this.backToBack ? "Back to back " : "") + "T-Spin Single" + (this.comboLength > 0 ? " + COMBO x " + this.comboLength : ""));
                this.backToBack = true;
            }
            // T-Spin Double
            else if (linesCleared == 2) {
                this.comboLength++;
                this.score += Scorer.Points.TSPIN_DOUBLE * this.getScoreMultiplier() + this.calculateComboBonus();
                console.log((this.backToBack ? "Back to back " : "") + "T-Spin Double" + (this.comboLength > 0 ? " + COMBO x " + this.comboLength : ""));
                this.backToBack = true;
            }
            // T-Spin Triple
            else if (linesCleared == 3) {
                this.comboLength++;
                this.score += Scorer.Points.TSPIN_TRIPLE * this.getScoreMultiplier() + this.calculateComboBonus();
                console.log((this.backToBack ? "Back to back " : "") + "T-Spin Triple" + (this.comboLength > 0 ? " + COMBO x " + this.comboLength : ""));
                this.backToBack = true;
            }
        }
        else {
            if (linesCleared == 0) {
                this.comboLength = -1;
            }
            // Single Line Clear
            else if (linesCleared == 1) {
                this.comboLength++;
                this.score += Scorer.Points.SINGLE + this.calculateComboBonus();
                this.backToBack = false;
                console.log("Single" + (this.comboLength > 0 ? " + COMBO x " + this.comboLength : ""));
            }
            // Double Line Clear
            else if (linesCleared == 2) {
                this.comboLength++;
                this.score += Scorer.Points.DOUBLE + this.calculateComboBonus();
                this.backToBack = false;
                console.log("Double" + (this.comboLength > 0 ? " + COMBO x " + this.comboLength : ""));
            }
            // Triple Line Clear
            else if (linesCleared == 3) {
                this.comboLength++;
                this.score += Scorer.Points.TRIPLE + this.calculateComboBonus();
                this.backToBack = false;
                console.log("Triple" + (this.comboLength > 0 ? " + COMBO x " + this.comboLength : ""));
            }
            // Tetris
            else if (linesCleared == 4) {
                this.comboLength++;
                this.score += Scorer.Points.TETRIS * this.getScoreMultiplier() + this.calculateComboBonus();
                console.log((this.backToBack ? "Back to back " : "") + "Tetris" + (this.comboLength > 0 ? " + COMBO x " + this.comboLength : ""));
                this.backToBack = true;
            }
        }
    }

    // use it
    awardPoints(points) {
        this.score += Scorer.Points.TRIPLE + this.calculateComboBonus();
    }

    getScoreMultiplier() {
        return this.backToBack ? Scorer.Points.BACK_TO_BACK_MULTIPLIER : 1;
    }

    calculateComboBonus() {
        return this.comboLength > 0 ? this.comboLength * Scorer.Points.COMBO_BONUS : 0;
    }

    awardSoftDropPoints() {
        this.score += Scorer.Points.SOFT_DROP;
    }

    awardHardDropPoints(distance) {
        this.score += distance * Scorer.Points.HARD_DROP_MULTIPLIER;
    }
}
