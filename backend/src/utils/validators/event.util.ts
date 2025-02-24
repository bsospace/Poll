
// Validate the event ID

import { body, param, query } from "express-validator";

export const getAllEventValidator = () => [
    query("page").optional().isNumeric().withMessage("Page must be a number"),
        query("pageSize").optional().isNumeric().withMessage("Page size must be a number"),
        query("search").optional().isString().withMessage("Search must be a string"),
        query("logs").optional().isBoolean().withMessage("Logs must be a boolean"),
]

export const getEventByIdValidator = () => [
    param("eventId").isString().withMessage("Event ID must be a string"),
]

export const createEventValidator = () => [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Event name is required")
        .isString()
        .withMessage("Event name must be a string"),

    body("description")
        .optional()
        .isString()
        .withMessage("Description must be a string"),

    body("whitelist")
        .optional()
        .isArray()
        .withMessage("Whitelist must be an array"),

    body("whitelist.*.email")
        .if(body("whitelist").exists())
        .isEmail()
        .withMessage("Each whitelist entry must have a valid email"),

    body("whitelist.*.point")
        .if(body("whitelist").exists())
        .isInt({ min: 1 })
        .withMessage("Each whitelist entry must have a point (integer >= 1)"),

    body("guest")
        .optional()
        .isArray()
        .withMessage("Guest list must be an array"),

    body("guest.*.id")
        .if(body("guest").exists())
        .isString()
        .withMessage("Each guest must have an id"),

    body("guest.*.name")
        .if(body("guest").exists())
        .isString()
        .withMessage("Each guest must have a name"),

    body("guest.*.key")
        .if(body("guest").exists())
        .isString()
        .withMessage("Each guest must have a key"),

    body("guest.*.point")
        .if(body("guest").exists())
        .isInt({ min: 1 })
        .withMessage("Each guest entry must have a point (integer >= 1)"),
];
