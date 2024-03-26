const bcrypt = require('bcryptjs')

const securePassword = async (password) => {
    try {
        const passwordHashed = await bcrypt.hash(password,10)
        return passwordHashed
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = securePassword