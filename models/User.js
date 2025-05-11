class User {
  constructor(id, name, email, phone, location, userType, image, token) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.location = location;
    this.userType = userType;
    this.image = image;
    this.token = token;
  }

  static fromJson(json) {
    return new User(
      json.id,
      json.name,
      json.email,
      json.phone,
      json.location,
      json.userType,
      json.image,
      json.token
    );
  }
}
