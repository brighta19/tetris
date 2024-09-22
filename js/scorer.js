class Scorer {
    static Points = {
        // reference: https://tetris.fandom.com/wiki/Scoring#Guideline_scoring_system
        SOFT_DROP: 1,
        HARD_DROP_MULTIPLIER: 2,
        SINGLE: 100,
        DOUBLE: 300,
        TRIPLE: 500,
        TETRIS: 800,            // BACK TO BACK
        TSPIN_MINI: 100,
        TSPIN_MINI_SINGLE: 200, // BACK TO BACK
        TSPIN_MINI_DOUBLE: 400, // BACK TO BACK
        TSPIN: 400,
        TSPIN_SINGLE: 800,      // BACK TO BACK
        TSPIN_DOUBLE: 1200,     // BACK TO BACK
        TSPIN_TRIPLE: 1600,     // BACK TO BACK

        // SINGLE_PERFECT_BONUS: 800,
        // DOUBLE_PERFECT_BONUS: 1200,
        // TRIPLE_PERFECT_BONUS: 1800,
        // TETRIS_PERFECT_BONUS: 2000,
        // BACK_TO_BACK_TETRIS_PERFECT_BONUS: 3200,

        BACK_TO_BACK_MULTIPLIER: 1.5,
        COMBO_BONUS: 50,
    };

    constructor() {
        this.score = 0;
        this.comboCounter = -1;
        this.backToBackEnabled = false;
    }

    updateScore(level, linesCleared, tSpin) {
        let points = 0;

        if (tSpin == Tetromino.TSpins.MINI) {
            if (linesCleared == 0) {
                points += Scorer.Points.TSPIN_MINI;
                console.log("T-Spin Mini");
            }
            else if (linesCleared == 1) {
                points += Scorer.Points.TSPIN_MINI_SINGLE;
                console.log((this.backToBackEnabled ? "Back to back " : "") + "T-Spin Mini Single" + (this.comboCounter > 0 ? " + COMBO x " + this.comboCounter : ""));
            }
            else if (linesCleared == 2) {
                points += Scorer.Points.TSPIN_MINI_DOUBLE;
                console.log((this.backToBackEnabled ? "Back to back " : "") + "T-Spin Mini Double" + (this.comboCounter > 0 ? " + COMBO x " + this.comboCounter : ""));
            }
        }
        else if (tSpin == Tetromino.TSpins.REGULAR) {
            if (linesCleared == 0) {
                points += Scorer.Points.TSPIN;
                console.log("T-Spin");
            }
            else if (linesCleared == 1) {
                points += Scorer.Points.TSPIN_SINGLE;
                console.log((this.backToBackEnabled ? "Back to back " : "") + "T-Spin Single" + (this.comboCounter > 0 ? " + COMBO x " + this.comboCounter : ""));
            }
            else if (linesCleared == 2) {
                points += Scorer.Points.TSPIN_DOUBLE;
                console.log((this.backToBackEnabled ? "Back to back " : "") + "T-Spin Double" + (this.comboCounter > 0 ? " + COMBO x " + this.comboCounter : ""));
            }
            else if (linesCleared == 3) {
                points += Scorer.Points.TSPIN_TRIPLE;
                console.log((this.backToBackEnabled ? "Back to back " : "") + "T-Spin Triple" + (this.comboCounter > 0 ? " + COMBO x " + this.comboCounter : ""));
            }
        }
        else {
            if (linesCleared == 1) {
                points += Scorer.Points.SINGLE;
                console.log("Single" + (this.comboCounter > 0 ? " + COMBO x " + this.comboCounter : ""));
            }
            else if (linesCleared == 2) {
                points += Scorer.Points.DOUBLE;
                console.log("Double" + (this.comboCounter > 0 ? " + COMBO x " + this.comboCounter : ""));
            }
            else if (linesCleared == 3) {
                points += Scorer.Points.TRIPLE;
                console.log("Triple" + (this.comboCounter > 0 ? " + COMBO x " + this.comboCounter : ""));
            }
            else if (linesCleared == 4) {
                points += Scorer.Points.TETRIS;
                console.log((this.backToBackEnabled ? "Back to back " : "") + "Tetris" + (this.comboCounter > 0 ? " + COMBO x " + this.comboCounter : ""));
            }
        }

        this.updateComboCounter(linesCleared);

        // if (points > 0) {
        //     let p = points;
        //     let b = this.canApplyBackToBackMultiplier(linesCleared, tSpin) ? Scorer.Points.BACK_TO_BACK_MULTIPLIER : 1;
        //     let c = this.canApplyComboBonus() ? this.comboCounter * Scorer.Points.COMBO_BONUS : 0;
        //     let l = level;
        //     console.log(`${(p*b+c)*l} = (${p} * ${b} + (${Scorer.Points.COMBO_BONUS}*${this.comboCounter})) * ${l}`);
        // }

        if (this.canApplyBackToBackMultiplier(linesCleared, tSpin))
            points *= Scorer.Points.BACK_TO_BACK_MULTIPLIER;

        if (this.canApplyComboBonus())
            points += this.comboCounter * Scorer.Points.COMBO_BONUS;

        this.score += points * level;

        this.updateBackToBackChain(linesCleared, tSpin);
    }

    updateComboCounter(linesCleared) {
        if (linesCleared > 0)
            this.comboCounter++;
        else
            this.comboCounter = -1;
    }

    canApplyComboBonus() {
        return this.comboCounter > 0;
    }

    updateBackToBackChain(linesCleared, tSpin) {
        if (this.isBackToBackLineClear(linesCleared, tSpin))
            this.backToBackEnabled = true;
        else if (linesCleared > 0)
            this.backToBackEnabled = false;
    }

    canApplyBackToBackMultiplier(linesCleared, tSpin) {
        return this.backToBackEnabled && this.isBackToBackLineClear(linesCleared, tSpin);
    }

    isBackToBackLineClear(linesCleared, tSpin) {
        return (linesCleared == 4) || (tSpin != null && linesCleared > 0);
    }

    awardSoftDropPoints() {
        this.score += Scorer.Points.SOFT_DROP;
    }

    awardHardDropPoints(distance) {
        this.score += distance * Scorer.Points.HARD_DROP_MULTIPLIER;
    }
}
