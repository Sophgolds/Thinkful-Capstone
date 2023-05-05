const service = require("./tables.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

// --------------------------VALIDATION MIDDLEWARE BEGINS-------------------------------------

const VALID_PROPERTIES = ["table_name", "capacity", "reservation_id"];

const hasRequiredDataProperties = (req, res, next) => {
  if (req.body.data) {
    return next();
  }
  next({ status: 400, message: "Body must contain data" });
};

const hasOnlyValidProperties = (req, res, next) => {
  const { data = {} } = req.body;
  const validProperties = Object.keys(data).filter(
    (field) => !VALID_PROPERTIES.includes(field)
  );
  if (validProperties.length) {
    next({
      status: 400,
      message: `Invalid field(s): ${validProperties.join(", ")}`,
    });
  }
  next();
};

const hasProperties = (...properties) => {
  return function (req, res, next) {
    const { data = {} } = req.body;
    try {
      properties.forEach((property) => {
        if (!data[property]) {
          const error = new Error(`A ${property} property is required`);
          error.status = 400;
          throw error;
        }
      });
      next();
    } catch (error) {
      next(error);
    }
  };
};

const tableLengthValidation = (req, res, next) => {
  const { table_name } = req.body.data;
  if (table_name.length < 2) {
    next({
      status: 400,
      message: "table_name must have at least 2 characters",
    });
  }
  next();
};

const CapacityCheckValidation = (req, res, next) => {
  const { capacity } = req.body.data;
  if (capacity < 1 || typeof capacity !== "number") {
    next({
      status: 400,
      message: "table capacity must be able to seat at least one person",
    });
  }
  next();
};

const create = async (req, res, next) => {
  const data = await service.create(req.body.data);
  res.status(201).json({ data: data });
};

const reservationExists = async (req, res, next) => {
  const { reservation_id } = req.body.data;
  const reservation = await service.readReservation(reservation_id);
  if (reservation) {
    res.locals.reservation = reservation;
    return next();
  }
  next({
    status: 404,
    message: `No reservation_id matching ${reservation_id} found in the database`,
  });
};

const tableExists = async (req, res, next) => {
  const { table_id } = req.params;
  const table = await service.read(table_id);
  if (table) {
    res.locals.table = table;
    return next();
  }
  next({
    status: 404,
    message: `No table_id matching ${table_id} forund in the database `,
  });
};

const canTableFitParty = (req, res, next) => {
  const { people } = res.locals.reservation;
  const { capacity } = res.locals.table;
  if (people > capacity) {
    return next({
      status: 400,
      message: "Table capacity is to small to fit your party size",
    });
  }
  next();
};

const isTableOccupied = (req, res, next) => {
  const { reservation_id } = res.locals.table;
  if (reservation_id) {
    return next({ status: 400, message: "table is currently occupied" });
  }
  next();
};

const tableIsNotOccupied = (req, res, next) => {
  const { reservation_id } = res.locals.table;
  if (!reservation_id) {
    return next({ status: 400, message: "not occupied" });
  }
  next();
};

const isReservationAlreadySeated = (req, res, next) => {
  const { status } = res.locals.reservation;
  if (status && status === "seated") {
    return next({ status: 400, message: "reservation is already seated" });
  }
  next();
};

const findReservation = async (req, res, next) => {
  const { reservation_id } = res.locals.table;
  const reservation = await service.readReservation(reservation_id);
  if (reservation) {
    res.locals.reservation = reservation;
    return next();
  }
  next({
    status: 404,
    message: `no reservation with ID ${reservation_id} found`,
  });
};
// --------------------------------VALIDATION MIDDLEWARE ENDS --------------------------------

// This function will send all the tables in the database
const list = async (req, res, next) => {
  const tableList = await service.list();
  res.json({ data: tableList });
};

const seatReservation = async (req, res, next) => {
  const updatedTable = {
    ...req.body.data,
    table_id: res.locals.table.table_id,
  };
  const updatedReservation = {
    ...res.locals.reservation,
    status: "seated",
  };
  const data = await service.update(updatedTable, updatedReservation);
  res.json({ data });
};

const finishReservation = async (req, res, next) => {
  const table = res.locals.table;
  const updatedTable = {
    ...table,
    reservation_id: null,
    status: "free",
  };
  const updatedReservation = {
    ...res.locals.reservation,
    reservation_id: res.locals.reservation.reservation_id,
    status: "finished",
  };
  const data = await service.update(updatedTable, updatedReservation);
  res.json({ data });
};

module.exports = {
  create: [
    hasRequiredDataProperties,
    hasOnlyValidProperties,
    hasProperties("table_name", "capacity"),
    tableLengthValidation,
    CapacityCheckValidation,
    asyncErrorBoundary(create),
  ],
  list: asyncErrorBoundary(list),
  seatReservation: [
    asyncErrorBoundary(tableExists),
    hasRequiredDataProperties,
    hasProperties("reservation_id"),
    asyncErrorBoundary(reservationExists),
    isReservationAlreadySeated,
    canTableFitParty,
    isTableOccupied,
    asyncErrorBoundary(seatReservation),
  ],
  finishReservation: [
    asyncErrorBoundary(tableExists),
    tableIsNotOccupied,
    asyncErrorBoundary(findReservation),
    asyncErrorBoundary(finishReservation),
  ],
};