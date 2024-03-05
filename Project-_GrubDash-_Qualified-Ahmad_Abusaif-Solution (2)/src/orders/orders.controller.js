const path = require("path");
const orders = require(path.resolve("src/data/orders-data"));
const nextId = require("../utils/nextId");

function list(req, res) {
  res.send({ data: orders });
}

function idChecker(req, res, next) {
  const orderId = req.params.orderId;
  const dataId = req.body.data.id;

  if (!orderId) {
    return next({
      status: 400,
      message: `${dataId}`,
    });
  }
  if (dataId && orderId !== dataId) {
    return next({
      status: 400,
      message: `${dataId} id`,
    });
  }
  next();
}

function orderExists(req, res, next) {
  const orderId = req.params.orderId;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (!foundOrder) {
    return next({
      status: 404,
      message: `${orderId}`,
    });
  }
  res.locals.foundOrder = foundOrder;
  next();
}

function deliverChecker(req, res, next) {
  const deliverTo = req.body.data.deliverTo;
  if (!deliverTo || deliverTo === "") {
    next({
      status: 400,
      message: "deliverTo",
    });
  }
  next();
}

function mobileNumberChecker(req, res, next) {
  const mobileNumber = req.body.data.mobileNumber;

  if (!mobileNumber || mobileNumber === "") {
    next({
      status: 400,
      message: "mobileNumber",
    });
  }
  next();
}

function dishesChecker(req, res, next) {
  const dishes = req.body.data.dishes;

  if (!dishes || dishes === "" || dishes.length === 0 || !Array.isArray(dishes)) {
    next({
      status: 400,
      message: "dishes missing or empty",
    });
  }
  next();
}

function quantityChecker(req, res, next) {
  const dishes = req.body.data.dishes;
  if (!Array.isArray(dishes) || !dishes) {
    return next({
      status: 400,
      message: "dish",
    });
  }

  for (const index in dishes) {
    let dish = dishes[index];
    const quantity = dish.quantity;
    if (!(quantity) || quantity < 1 || !(Number.isInteger(quantity))) {
      return next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
      });
    }
  }
  next();
}

function statusChecker(req, res, next) {
  const orderId = req.params.orderId;
  const foundOrder = orders.find((order) => order.id === orderId);

  const orderStatus = foundOrder.status;
  if (!orderStatus || orderStatus === "") {
    return next({
      status: 400,
      message: 'status',
    });
  }
  if (orderStatus !== 'pending') {
    return next({
      status: 400,
      message: 'pending',
    });
  }
  next();
}

function read(req, res, next) {
  const foundOrder = res.locals.foundOrder;
  if (foundOrder) {
    return res.send({ data: foundOrder });
  }
  next({
    status: 404,
    message: "Invalid orderId",
  });
}

function orderStatus(req, res, next) {
  const { data: { status } = {} } = req.body;
  if (!status || typeof status !== 'string' || status.trim().length === 0) {
    return next({
      status: 400,
      message: 'Order should have a non-empty status.',
    });
  }

  const validStatusValues = ['pending', 'processing', 'completed'];
  if (!validStatusValues.includes(status.toLowerCase())) {
    return next({
      status: 400,
      message: 'status',
    });
  }
  next();
}

function destroy(req, res, next) {
  const orderId = req.params.orderId;
  const foundOrder = orders.find((order) => order.id === orderId);
  const index = orders.findIndex((order) => order.id === orderId);
  const orderStatus = foundOrder.status;
  if (index > -1) {
    orders.splice(index, 1);
    res.sendStatus(204);
  }
  next({
    status: 404,
    message: `${orderId}`,
  });
}

function update(req, res, next) {
  const orderId = req.params.orderId;
  const newOrder = req.body.data;

  const index = orders.findIndex((order) => Number(order.id) === Number(orderId));
  orders[index] = {
    ...orders[index],
    ...newOrder,
    id: orderId,
  };

  res.status(200).json({ data: orders[index] });
}


function create(req,res,next){
  const newOrder = req.body.data
  
  newOrder.id = nextId()
  
  orders.push(newOrder)
  res.status(201).json({data:newOrder})
}

module.exports = {
  list,
  read: [orderExists,read],
  create: [deliverChecker,mobileNumberChecker,quantityChecker,dishesChecker,create],
  update: [orderExists,idChecker,orderStatus,deliverChecker,mobileNumberChecker,dishesChecker,quantityChecker,statusChecker,update],
  delete:[orderExists,statusChecker,destroy],
}