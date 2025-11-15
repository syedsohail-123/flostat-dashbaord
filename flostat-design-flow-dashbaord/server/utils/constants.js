export const roles = {
    SUPER_ADMIN:"root",
    ADMIN:"admin",
    CONTROLLER:"controller",
    GUEST:"guest"
}

export const roleStatus = {
    PENDING:"pending",
    ACTIVE:"active",
    DEACTIVE:"deactive"
}

export const deviceStatus = {
    PENDING:"pending",
    ACTIVE:"active",
    DEACTIVE:"deactive"
}
export const device_Type = {
    PUMP:"pump",
    SUMP:"sump",
    VALVE:"valve",
    TANK:"tank"
}
export const parentType = {
    sump:null,
    pump: device_Type.SUMP,
    valve: device_Type.PUMP,
    tank: device_Type.VALVE
}
export const PUMP_STATUS = {
    ON:"ON",
    OFF:"OFF"
}
export const VALVE_STATUS = {
    OPEN:"OPEN",
    CLOSE:"CLOSE"
}

export const MODE = {
    MANUAL:"manual",
    AUTO:"auto"
}
export const MIN_THRESHOLD = 25;
export const MAX_THRESHOLD = 75;
export const SCHEDULE_PENDING_STATUS = {
    CREATING:"CREATING",
    UPDATING:"UPDATING",
    DELETING:"DELETING"
}
export const SCHEDULE_COMPLETED_STATUS = {
    CREATED:"CREATED",
    UPDATED:"UPDATED",
    DELETED:"DELETED"
}
export const USER_DEVICE = {
    MOBILE:"mobile",
    LAPTOP:"laptop",
    DESKTOP:"desktop"
    
}
export const HARDWARE = "hardware";
export const LEVEL = {
    HIGH:"HIGH",
    LOW:"LOW"
}
export const QUREY_STATUS = {
    ACTIVE:"active",
    CLOSE:"close",
    DEACTIVATED:"deactivated"
}

export const USER_TYPE = {
    CUSTOMER:"customer",
    FLOSTAT:"flostat"
}