const { User } = require("../models");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const mailService = require("./mail-service");
const tokenService = require("./token-service");
const { UserDto } = require("../dtos/user-dto");
const ApiError = require("../exceptions/api-error");
const { where } = require("sequelize");

class UserService {
  async updateUser(firstName, lastName, email) {
    const candidate = await User.findOne({ where: { email } });

    if (!candidate) {
      throw new ApiError.BadRequest(`User with email ${email} does not exist`);
    }

    const updatedUser = await User.update(
      {
        firstName,
        lastName,
      },
      {
        where: { email },
        returning: true,
        plain: true,
      }
    );

    const userDto = new UserDto(updatedUser[1]);

    return { user: userDto };
  }

  async registration(firstName, lastName, email, password) {
    const candidate = await User.findOne({ where: { email } });

    if (candidate) {
      throw ApiError.BadRequest(`User with email ${email} is already exist`);
    }
    const hashPassword = await bcrypt.hash(password, 3);
    const activationLink = uuid.v4();
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashPassword,
      activationLink,
    });

    await mailService.sendActivationMail(
      email,
      `${process.env.API_URL}/api/activate/${activationLink}`
    );

    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });

    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }

  async activate(activationLink) {
    const user = await User.findOne({ where: { activationLink } });

    if (!user) {
      throw ApiError.BadRequest("Invalid activation link");
    }

    user.isActivated = true;
    await user.save();
  }

  async login(email, password) {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw ApiError.BadRequest("User with this email not found");
    }

    const isPassEquals = await bcrypt.compare(password, user.password);

    if (!isPassEquals) {
      throw ApiError.BadRequest("Incorrect password");
    }

    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });

    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }

  async logout(refreshToken) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError();
    }

    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = tokenService.findToken(refreshToken);

    if (!userData || !tokenFromDb) {
      throw ApiError.UnauthorizedError();
    }

    const user = await User.findByPk(userData.id);
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });

    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }

  async forgot(email) {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw ApiError.BadRequest("User with this email not found");
    }

    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });

    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    const link = `${process.env.API_URL}/api/reset-password/${userDto.id}/${tokens.refreshToken}`;

    await mailService.sendResetPasswordMail(email, link);

    return link;
  }

  async resetPassword(id, accessToken, password) {
    const user = await User.findOne({ where: { id } });

    if (!user) {
      throw ApiError.BadRequest("User not found");
    }

    const hashPassword = await bcrypt.hash(password, 3);

    user.password = hashPassword;

    await user.save();
  }

  async getAllUsers() {
    const users = await User.findAll();

    return users;
  }
}

module.exports = new UserService();
