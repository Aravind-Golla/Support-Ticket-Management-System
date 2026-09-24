const ticketService = require('../services/ticketService');

async function create(req, res, next) {
  try {
    const ticket = await ticketService.createTicket(req.user, req.body || {});
    res.status(201).json({
      success: true,
      message: 'Ticket created',
      data: ticket,
    });
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const tickets = await ticketService.listTickets(req.user, req.query);
    res.status(200).json({
      success: true,
      data: tickets,
    });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const ticket = await ticketService.getTicketForUser(req.params.id, req.user);
    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const ticket = await ticketService.updateTicket(req.params.id, req.user, req.body || {});
    res.status(200).json({
      success: true,
      message: 'Ticket updated',
      data: ticket,
    });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const result = await ticketService.deleteTicket(req.params.id, req.user);
    res.status(200).json({
      success: true,
      message: 'Ticket deleted',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function openReport(req, res, next) {
  try {
    const rows = await ticketService.getOpenTicketsWithCustomers();
    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, getById, update, remove, openReport };
