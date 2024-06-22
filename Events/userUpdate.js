const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: 'userUpdate',
    async execute(oldUser, newUser) {
        const userData = await db.get(`prevnames.${newUser.id}`) || { username: '', previous_usernames: [] };

        if (oldUser.username !== newUser.username) {
            userData.previous_usernames.push({ type: 'username', value: oldUser.username, date: Date.now() });
        }

        if (oldUser.globalName !== newUser.globalName) {
            userData.previous_usernames.push({ type: 'globalName', value: oldUser.globalName || oldUser.username, date: Date.now() });
        }

        await db.set(`prevnames.${newUser.id}`, { username: newUser.username, previous_usernames: userData.previous_usernames });

        console.log(`Updated user data for ${newUser.username} (${newUser.id})`);
    },
};