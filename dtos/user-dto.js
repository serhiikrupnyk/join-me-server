class UserDto {
  id;
  firstName;
  lastName;
  email;
  isActivated;

  constructor(model) {
    this.id = model.id;
    this.firstName = model.firstName;
    this.lastName = model.lastName;
    this.email = model.email;
    this.isActivated = model.isActivated;
  }
}

module.exports = { UserDto };
