class Location {
  constructor(latitude, longitude, location) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.location = location;
  }

  static fromJson(json) {
    return new Location(json.latitude, json.longitude, json.location);
  }
}

class Price {
  constructor(amount, currency) {
    this.amount = amount;
    this.currency = currency;
  }

  static fromJson(json) {
    return new Price(json.amount, json.currency);
  }
}

class Product {
  constructor(
    id,
    categoryId,
    name,
    photos,
    location,
    price,
    createdAt,
    isActive
  ) {
    this.id = id;
    this.categoryId = categoryId;
    this.name = name;
    this.photos = photos;
    this.location = location; // instance of Location
    this.price = price; // instance of Price
    this.createdAt = createdAt;
    this.isActive = isActive;
  }

  static fromJson(json) {
    return new Product(
      json.id,
      json.category_id,
      json.name,
      json.photos,
      Location.fromJson(json.location),
      Price.fromJson(json.price),
      json.created_at,
      json.is_active
    );
  }
}
