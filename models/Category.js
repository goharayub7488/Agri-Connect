class Category {
  constructor(id, name, icon) {
    this.id = id;
    this.name = name;
    this.icon = icon;
  }

  static fromJson(json) {
    return new Category(json.id, json.name, json.icon);
  }
}
