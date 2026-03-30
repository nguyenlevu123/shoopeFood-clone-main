const { Restaurant, User } = require("../models");

const normalizeRestaurant = (item) => ({
  id: item.id,
  ownerId: item.ownerId,
  name: item.name,
  address: item.address || "",
  latitude: Number(item.latitude || 0),
  longitude: Number(item.longitude || 0),
  openingTime: item.openingTime || "07:00:00",
  closingTime: item.closingTime || "22:00:00",
  isOpen: Boolean(item.isOpen),
  imageUrl: item.imageUrl || null,
  ratingAvg: Number(item.ratingAvg || 0),
  deletedAt: item.deletedAt || null,
});

const verifyCoordinates = (latitude, longitude) => {
  if (!Number.isFinite(Number(latitude)) || Number(latitude) < -90 || Number(latitude) > 90) {
    return "latitude must be between -90 and 90";
  }

  if (!Number.isFinite(Number(longitude)) || Number(longitude) < -180 || Number(longitude) > 180) {
    return "longitude must be between -180 and 180";
  }

  return null;
};

const verifyTimes = (openingTime, closingTime) => {
  if (!openingTime || !closingTime) {
    return "opening_time and closing_time are required";
  }

  const [h1, m1] = String(openingTime).split(":").map(Number);
  const [h2, m2] = String(closingTime).split(":").map(Number);

  const openSeconds = h1 * 3600 + m1 * 60;
  const closeSeconds = h2 * 3600 + m2 * 60;

  if (Number.isNaN(openSeconds) || Number.isNaN(closeSeconds) || openSeconds >= closeSeconds) {
    return "opening_time must be earlier than closing_time";
  }

  return null;
};

const withError = (res, status, message) => res.status(status).json({ error: { message } });
const withSuccess = (res, status, message, data) => res.status(status).json({ success: { message, data } });

exports.listRestaurants = async (req, res) => {
  try {
    const items = await Restaurant.findAll({ where: { deletedAt: null }, order: [["id", "ASC"]] });
    return withSuccess(res, 200, "Restaurants fetched", items.map(normalizeRestaurant));
  } catch (error) {
    return withError(res, 500, error.message);
  }
};

exports.getRestaurantById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return withError(res, 400, "Invalid restaurant id");
    }

    const item = await Restaurant.findOne({ where: { id, deletedAt: null } });
    if (!item) {
      return withError(res, 404, "Restaurant not found");
    }

    return withSuccess(res, 200, "Restaurant fetched", normalizeRestaurant(item));
  } catch (error) {
    return withError(res, 500, error.message);
  }
};

exports.createRestaurant = async (req, res) => {
  try {
    const {
      ownerId,
      name,
      address = "",
      latitude = 0,
      longitude = 0,
      openingTime = "07:00:00",
      closingTime = "22:00:00",
      isOpen = true,
      imageUrl = null,
      ratingAvg = 5.0,
    } = req.body;

    if (!name || String(name).trim().length === 0) {
      return withError(res, 400, "name cannot be empty");
    }

    const owner = await User.findByPk(Number(ownerId));
    if (!owner) {
      return withError(res, 400, "owner_id is not valid");
    }

    const coordError = verifyCoordinates(latitude, longitude);
    if (coordError) {
      return withError(res, 400, coordError);
    }

    const timeError = verifyTimes(openingTime, closingTime);
    if (timeError) {
      return withError(res, 400, timeError);
    }

    const newRestaurant = await Restaurant.create({
      ownerId: Number(ownerId),
      name: String(name).trim(),
      address: String(address).trim(),
      latitude: Number(latitude),
      longitude: Number(longitude),
      openingTime,
      closingTime,
      isOpen: Boolean(isOpen),
      imageUrl: imageUrl ? String(imageUrl).trim() : null,
      ratingAvg: Number.isFinite(Number(ratingAvg)) ? Number(ratingAvg) : 5.0,
    });

    return withSuccess(res, 201, "Restaurant created", normalizeRestaurant(newRestaurant));
  } catch (error) {
    return withError(res, 500, error.message);
  }
};

exports.updateRestaurant = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return withError(res, 400, "Invalid restaurant id");
    }

    const item = await Restaurant.findOne({ where: { id, deletedAt: null } });
    if (!item) {
      return withError(res, 404, "Restaurant not found");
    }

    const {
      ownerId,
      name,
      address,
      latitude,
      longitude,
      openingTime,
      closingTime,
      isOpen,
      imageUrl,
      ratingAvg,
    } = req.body;

    if (!name || String(name).trim().length === 0) {
      return withError(res, 400, "name cannot be empty");
    }

    const nextOwnerId = ownerId !== undefined ? Number(ownerId) : item.ownerId;
    const owner = await User.findByPk(nextOwnerId);
    if (!owner) {
      return withError(res, 400, "owner_id is not valid");
    }

    const coordError = verifyCoordinates(latitude !== undefined ? latitude : item.latitude, longitude !== undefined ? longitude : item.longitude);
    if (coordError) {
      return withError(res, 400, coordError);
    }

    const timeError = verifyTimes(openingTime || item.openingTime, closingTime || item.closingTime);
    if (timeError) {
      return withError(res, 400, timeError);
    }

    await item.update({
      name: String(name).trim(),
      address: address !== undefined ? String(address).trim() : item.address,
      ownerId: nextOwnerId,
      latitude: Number(latitude !== undefined ? latitude : item.latitude),
      longitude: Number(longitude !== undefined ? longitude : item.longitude),
      openingTime: openingTime || item.openingTime,
      closingTime: closingTime || item.closingTime,
      isOpen: isOpen !== undefined ? Boolean(isOpen) : item.isOpen,
      imageUrl: imageUrl !== undefined ? (imageUrl ? String(imageUrl).trim() : null) : item.imageUrl,
      ratingAvg: ratingAvg !== undefined && Number.isFinite(Number(ratingAvg)) ? Number(ratingAvg) : item.ratingAvg,
    });

    return withSuccess(res, 200, "Restaurant updated", normalizeRestaurant(item));
  } catch (error) {
    return withError(res, 500, error.message);
  }
};

exports.deleteRestaurant = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return withError(res, 400, "Invalid restaurant id");
    }

    const item = await Restaurant.findOne({ where: { id, deletedAt: null } });
    if (!item) {
      return withError(res, 404, "Restaurant not found");
    }

    await item.update({ deletedAt: new Date() });
    return withSuccess(res, 200, "Restaurant deleted", normalizeRestaurant(item));
  } catch (error) {
    return withError(res, 500, error.message);
  }
};

exports.patchRestaurantStatus = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return withError(res, 400, "Invalid restaurant id");
    }

    const { isOpen } = req.body;
    if (typeof isOpen !== "boolean") {
      return withError(res, 400, "isOpen must be boolean");
    }

    const item = await Restaurant.findOne({ where: { id, deletedAt: null } });
    if (!item) {
      return withError(res, 404, "Restaurant not found");
    }

    await item.update({ isOpen });
    return withSuccess(res, 200, "Restaurant status updated", normalizeRestaurant(item));
  } catch (error) {
    return withError(res, 500, error.message);
  }
};

exports.patchRestaurantLocation = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return withError(res, 400, "Invalid restaurant id");
    }

    const { latitude, longitude } = req.body;
    const coordError = verifyCoordinates(latitude, longitude);
    if (coordError) {
      return withError(res, 400, coordError);
    }

    const item = await Restaurant.findOne({ where: { id, deletedAt: null } });
    if (!item) {
      return withError(res, 404, "Restaurant not found");
    }

    await item.update({ latitude: Number(latitude), longitude: Number(longitude) });
    return withSuccess(res, 200, "Restaurant location updated", normalizeRestaurant(item));
  } catch (error) {
    return withError(res, 500, error.message);
  }
};

exports.verifyCoordinates = verifyCoordinates;
exports.verifyTimes = verifyTimes;
