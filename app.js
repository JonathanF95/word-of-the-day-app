const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

// Database setup
async function createDatabase() {
    const db = await open({
        filename: 'word_database.db',
        driver: sqlite3.Database
    });

    await db.exec(`CREATE TABLE IF NOT EXISTS words (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word TEXT NOT NULL,
        definition TEXT NOT NULL,
        example TEXT,
        last_shown TEXT
    )`);

    await db.close();
}

// Add a word to the database
async function addWord(word, definition, example) {
    const db = await open({
        filename: 'word_database.db',
        driver: sqlite3.Database
    });

    await db.run('INSERT INTO words (word, definition, example) VALUES (?, ?, ?)', 
                 [word, definition, example]);

    await db.close();
}

// Get word of the day
async function getWordOfTheDay() {
    const db = await open({
        filename: 'word_database.db',
        driver: sqlite3.Database
    });

    const today = new Date().toISOString().split('T')[0];

    const result = await db.get(`SELECT word, definition, example FROM words 
                                 WHERE last_shown IS NULL OR last_shown < ? 
                                 ORDER BY RANDOM() LIMIT 1`, today);

    if (result) {
        await db.run('UPDATE words SET last_shown = ? WHERE word = ?', 
                     [today, result.word]);
    }

    await db.close();
    return result;
}

// Example usage
async function main() {
    await createDatabase();

    await addWord("Ubiquitous", "Present, appearing, or found everywhere.", 
                  "Mobile phones are ubiquitous in modern society.");

    const wordOfTheDay = await getWordOfTheDay();
    if (wordOfTheDay) {
        console.log(`Word of the day: ${wordOfTheDay.word}`);
        console.log(`Definition: ${wordOfTheDay.definition}`);
        console.log(`Example: ${wordOfTheDay.example}`);
    } else {
        console.log("No word available for today.");
    }
}

main().catch(console.error);