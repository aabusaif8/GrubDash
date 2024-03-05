const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function list(req,res){
  res.send({data:dishes})
}
function dishExists(req,res,next){
  const dishId = req.params.dishId
  const foundDish = dishes.find((dish) => dish.id === dishId)
  if(!foundDish){
    return next({
      status:404,
      message:"dish doesn't exist"
    })
  }
  res.locals.foundDish = foundDish;
  next()
}
function read(req,res,next){
  const dishId = req.params.dishId
  const foundDish = res.locals.foundDish
  
  if(foundDish){
    res.send({data:foundDish})
  }
  next({
    status:404,
    message:"Invalid dishId"
  })
}

function destroy(req,res,next){
  const dishId = req.params.dishId
  const index = dishes.findIndex((dish) => dish.id === dishId)
  
  if( index > -1){
    res.locals.deletedDish = dishes[index]
    dishes.splice(index, 1)
    next()
  }
  next({
    status:405,
    message:"non-existant dish"
  })
}

function idChecker(req,res,next){
  const dishId = req.params.dishId
  const dataId = req.body.data.id
  
  if(!dishId){
    return next({
      status:400,
      message:`${dataId}`
    })
  } 
  if(dataId && dishId !== dataId ){
    return next({
      status:400,
      message:`${dataId} id`
    })
  }
    next()
}

// checks to see if name property is present, and if it is an empty string or not

function nameChecker(req,res,next){
  const name = req.body.data.name
  
  if(!name){
    next({
      status:400,
      message:"name is missing"
    })
  }else if (name === ""){
    next({
      status:400,
      message: "name is empty"
    })
  }else if (name){
    next()
  }
}

function descriptionChecker(req,res,next){
  const description = req.body.data.description
  
  if(description){
    next()
  }
  else if(description === ""){
    next({
      status:400,
      message:"description is empty"
    })
  }else if (!description){
    next({
      status:400,
      message:"description is missing."
    })
  }
}



function imgUrlChecker(req,res,next){
  const imgUrl = req.body.data.image_url

  if(!imgUrl){
    next({
      status:400,
      message:"image_url"
    })
  }else if(imgUrl === ""){
    next({
      status:400,
      message:"img_url is empty"
    })
  } else{
    next()
  }
}

function priceChecker(req,res,next){
  function isNumber(price){
  return typeof price === "number"
  }
  const price = req.body.data.price
  
  const isPriceNumber = isNumber(price)
  
  if(!price){
    next({
      status:400,
      message:"price is missing"
    })
  }else if(!isPriceNumber){
    next({
      status:400,
      message:"price is not a number"
    })
  }else if (price === 0 || price < 0 ){
    next({
      status:400,
      message:"price cannot be 0 or less than 0"
    })
  }else{
    next()
  }
}

function create(req,res,next){
  const newDish = req.body.data
  newDish.id = nextId()
  
  dishes.push(newDish)
  res.status(201).json({data:newDish})
}

function update(req,res,next){
  const dishId = req.params.dishId
const currentDish = dishes.find((dish) => dish.id === dishId)
  const newDish = req.body.data
  const index = dishes.findIndex((dish => dish.id === dishId))
  if(index === -1){
    next({
      status:404,
      message:"dish"
    })
  }
  dishes[index] = {
    ...newDish,
    id: dishId
  }
  res.status(200).json({data:dishes[index]})
}


module.exports = {
  list,
  read:[dishExists,read],
  delete: destroy,
  update:[dishExists,idChecker,nameChecker, descriptionChecker,imgUrlChecker ,priceChecker, update],
  create:[nameChecker,descriptionChecker, imgUrlChecker,priceChecker, create],
}