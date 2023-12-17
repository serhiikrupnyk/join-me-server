const { User } = require('../models');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailService = require('./mail-service');
const tokenService = require('./token-service');
const { UserDto } = require('../dtos/user-dto')

class UserService {
    async registration(firstName, lastName, email, password) {
        const candidate = await User.findOne({ where: {email} });

        if (candidate) {
            throw new Error(`User with email ${email} is already exist`);
        }
        const hashPassword = await bcrypt.hash(password, 3);
        const activationLink = uuid.v4();
        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashPassword,
            activationLink
        });

        await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);

        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});
        console.log('userDto: ', userDto);
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return { ...tokens, user: userDto }
    }   
}

module.exports = new UserService();