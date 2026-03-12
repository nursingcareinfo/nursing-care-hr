/**
 * HR Staff Management System - Google Sheets Web App
 * Features: CRUD, REST API, Validation, Auto-ID
 * Deploy: Execute as Me, Who has access: Anyone
 */

const SHEET_NAME = 'Staff Data';
const CONFIG_SHEET = 'Config';

function doGet(e) { return Router.route(e); }
function doPost(e) { return Router.route(e); }

const Config = (() => {
  const ns = {};
  ns.fieldTypes = { text: 'text', number: 'number', date: 'date', multiline: 'multiline', select: 'select' };
  ns.modelDefs = {
    'staff': {
      fields: {
        'id': { type: ns.fieldTypes.text, readonly: true },
        'assignedId': { type: ns.fieldTypes.text, required: true },
        'name': { type: ns.fieldTypes.text, required: true },
        'fatherHusbandName': { type: ns.fieldTypes.text },
        'dateOfBirth': { type: ns.fieldTypes.date },
        'gender': { type: ns.fieldTypes.select, options: ['Male', 'Female'] },
        'cnic': { type: ns.fieldTypes.text },
        'designation': { type: ns.fieldTypes.select, options: ['R/N', 'Nurse Assistant', 'Attendant', 'Mid Wife', 'Baby Sitter', 'BSN', 'Doctor'] },
        'contact1': { type: ns.fieldTypes.text, required: true },
        'contact2': { type: ns.fieldTypes.text },
        'district': { type: ns.fieldTypes.text },
        'status': { type: ns.fieldTypes.select, options: ['active', 'inactive', 'on-leave'] },
        'hireDate': { type: ns.fieldTypes.date },
        'notes': { type: ns.fieldTypes.multiline },
        'createdAt': { type: ns.fieldTypes.text, readonly: true }
      },
      displayText: (res) => res.assignedId + ' - ' + res.name
    }
  };
  return ns;
})();

const Router = (() => {
  const ns = {};
  ns.route = (ctx) => {
    const path = ctx.pathInfo || '';
    if (path.startsWith('api/')) return API.handle(ctx);
    if (path.startsWith('admin/')) {
      const parts = path.split('/');
      ctx.type = parts[1];
      ctx.action = parts[2] || 'list';
      ctx.id = parts[3] || null;
      return Controller[ctx.action](ctx);
    }
    if (path === 'nextId') return API.getNextId(ctx);
    return HtmlService.createHtmlOutput('<h1>HR Staff Management</h1><p><a href="/admin/staff/list">Manage Staff</a></p><p><a href="/api/staff">REST API</a></p>');
  };
  ns.buildAdminLink = (type, action, id) => {
    let link = ScriptApp.getService().getUrl() + '/admin/' + type + '/' + action;
    if (id) link += '/' + id;
    return link;
  };
  return ns;
})();

const API = (() => {
  const ns = {};
  
  ns.getNextId = (ctx) => {
    const num = getLastId() + 1;
    return ContentService.createTextOutput(JSON.stringify({ nextId: 'NC-KHI-' + ('000' + num).slice(-3) }))
      .setMimeType(ContentService.MimeType.JSON);
  };
  
  ns.handle = (ctx) => {
    const path = ctx.pathInfo.replace('api/', '');
    if (path === 'staff' && ctx.method === 'GET') return ns.getAllStaff(ctx);
    if (path === 'staff' && ctx.method === 'POST') return ns.createStaff(ctx);
    if (path.startsWith('staff/') && ctx.method === 'GET') return ns.getStaff(ctx);
    if (path.startsWith('staff/') && ctx.method === 'PUT') return ns.updateStaff(ctx);
    if (path.startsWith('staff/') && ctx.method === 'DELETE') return ns.deleteStaff(ctx);
    return ContentService.createTextOutput(JSON.stringify({ error: 'Not found' })).setMimeType(ContentService.MimeType.JSON);
  };
  
  ns.getAllStaff = (ctx) => {
    const staff = Model.read('staff');
    return ContentService.createTextOutput(JSON.stringify(staff)).setMimeType(ContentService.MimeType.JSON);
  };
  
  ns.getStaff = (ctx) => {
    const id = ctx.pathInfo.split('/')[1];
    const staff = Model.read('staff', id);
    return ContentService.createTextOutput(JSON.stringify(staff)).setMimeType(ContentService.MimeType.JSON);
  };
  
  ns.createStaff = (ctx) => {
    const data = JSON.parse(ctx.postData.contents);
    data.id = Utilities.getUuid();
    data.assignedId = data.assignedId || getNextAssignedId();
    data.createdAt = new Date().toISOString();
    Model.create('staff', [data]);
    incrementLastId();
    return ContentService.createTextOutput(JSON.stringify({ success: true, id: data.id, assignedId: data.assignedId })).setMimeType(ContentService.MimeType.JSON);
  };
  
  ns.updateStaff = (ctx) => {
    const id = ctx.pathInfo.split('/')[1];
    const data = JSON.parse(ctx.postData.contents);
    data.id = id;
    Model.update('staff', [data]);
    return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
  };
  
  ns.deleteStaff = (ctx) => {
    const id = ctx.pathInfo.split('/')[1];
    Model.delete('staff', [id]);
    return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
  };
  
  return ns;
})();

const Controller = (() => {
  const ns = {};
  
  ns.list = (ctx) => {
    ctx.resources = Model.read(ctx.type);
    ctx.resources.forEach(res => res.showLink = Router.buildAdminLink(ctx.type, 'show', res.id));
    ctx.addLink = Router.buildAdminLink(ctx.type, 'add');
    return renderTemplate('v/list', ctx);
  };
  
  ns.show = (ctx) => {
    ctx.resource = Model.read(ctx.type, ctx.id);
    ctx.editLink = Router.buildAdminLink(ctx.type, 'edit', ctx.id);
    ctx.deleteLink = Router.buildAdminLink(ctx.type, 'delete', ctx.id);
    return renderTemplate('v/show', ctx);
  };
  
  ns.add = (ctx) => {
    ctx.resource = { id: '', assignedId: getNextAssignedId(), status: 'active' };
    ctx.formLink = Router.buildAdminLink(ctx.type, 'create');
    return renderTemplate('v/form', ctx);
  };
  
  ns.edit = (ctx) => {
    ctx.resource = Model.read(ctx.type, ctx.id);
    ctx.formLink = Router.buildAdminLink(ctx.type, 'update', ctx.id);
    return renderTemplate('v/form', ctx);
  };
  
  ns.create = (ctx) => {
    ctx.parameter.id = Utilities.getUuid();
    ctx.parameter.createdAt = new Date().toISOString();
    ctx.parameter.assignedId = ctx.parameter.assignedId || getNextAssignedId();
    Model.create(ctx.type, [ctx.parameter]);
    incrementLastId();
    ctx.redirectText = 'View new staff';
    ctx.redirectLink = Router.buildAdminLink(ctx.type, 'show', ctx.parameter.id);
    return renderTemplate('v/redirect', ctx);
  };
  
  ns.update = (ctx) => {
    ctx.parameter.id = ctx.id;
    Model.update(ctx.type, [ctx.parameter]);
    ctx.redirectText = 'View updated staff';
    ctx.redirectLink = Router.buildAdminLink(ctx.type, 'show', ctx.id);
    return renderTemplate('v/redirect', ctx);
  };
  
  ns.delete = (ctx) => {
    Model.delete(ctx.type, [ctx.id]);
    ctx.redirectText = 'Staff list';
    ctx.redirectLink = Router.buildAdminLink(ctx.type, 'list');
    return renderTemplate('v/redirect', ctx);
  };
  
  const renderTemplate = (page, ctx) => {
    const template = HtmlService.createTemplateFromFile(page);
    template.ctx = ctx;
    const inner = template.evaluate().getContent();
    const outer = HtmlService.createTemplateFromFile('v/base').evaluate().getContent();
    return HtmlService.createHtmlOutput(outer.replace('!!INNERHTML!!', inner));
  };
  
  return ns;
})();

const Model = (() => {
  const ns = {};
  
  ns.create = (type, resources) => {
    if (lock(type) !== true) return;
    const sheet = getSheet(type);
    const headers = sheet.getRange('1:1').getValues()[0];
    const rows = resources.map(res => resToRow(headers, res));
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, headers.length).setValues(rows);
    unlock(type);
    return resources;
  };
  
  ns.read = (type, id) => {
    const sheet = getSheet(type);
    const values = sheet.getDataRange().getValues();
    if (values.length < 2) return id ? null : [];
    const headers = values[0];
    const resources = values.slice(1).map(row => rowToRes(headers, row));
    if (!id) return resources;
    return resources.find(res => res.id === id) || null;
  };
  
  ns.update = (type, resources) => {
    if (lock(type) !== true) return;
    const values = getSheet(type).getDataRange().getValues();
    const headers = values[0];
    const idCol = headers.indexOf('id');
    resources.forEach(res => {
      const rowIdx = values.findIndex(row => row[idCol] === res.id);
      if (rowIdx > 0) values[rowIdx] = resToRow(headers, res);
    });
    getSheet(type).getDataRange().setValues(values);
    unlock(type);
  };
  
  ns.delete = (type, ids) => {
    if (lock(type) !== true) return;
    const values = getSheet(type).getDataRange().getValues();
    const headers = values[0];
    const idCol = headers.indexOf('id');
    const keep = values.filter(row => !ids.includes(row[idCol]));
    getSheet(type).clear();
    if (keep.length > 0) getSheet(type).getRange(1, 1, keep.length, headers.length).setValues(keep);
    unlock(type);
  };
  
  const lock = (type) => {
    for (let i = 0; i < 30; i++) {
      const status = PropertiesService.getScriptProperties().getProperty('lock_' + type);
      if (status === 'unlocked' || !status) {
        PropertiesService.getScriptProperties().setProperty('lock_' + type, 'locked');
        return true;
      }
      Utilities.sleep(1000);
    }
    throw new Error('Lock timeout');
  };
  
  const unlock = (type) => {
    PropertiesService.getScriptProperties().setProperty('lock_' + type, 'unlocked');
  };
  
  const getSheet = (name) => {
    let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
    if (!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(name);
      if (name === SHEET_NAME) {
        const fields = Object.keys(Config.modelDefs.staff.fields);
        sheet.appendRow(fields);
      } else if (name === CONFIG_SHEET) {
        sheet.appendRow(['Last ID Number', '245']);
      }
    }
    return sheet;
  };
  
  const resToRow = (headers, res) => headers.map(h => res[h] || '');
  const rowToRes = (headers, row) => {
    const res = {};
    row.forEach((v, i) => res[headers[i]] = v);
    return res;
  };
  
  return ns;
})();

function getLastId() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG_SHEET);
    if (sheet && sheet.getLastRow() >= 2) {
      return parseInt(sheet.getRange(2, 1).getValue()) || 245;
    }
  } catch(e) {}
  return 245;
}

function getNextAssignedId() {
  const num = getLastId() + 1;
  return 'NC-KHI-' + ('000' + num).slice(-3);
}

function incrementLastId() {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG_SHEET);
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(CONFIG_SHEET);
    sheet.appendRow(['Last ID Number', '245']);
  }
  if (sheet.getLastRow() < 2) sheet.appendRow(['245']);
  const current = parseInt(sheet.getRange(2, 1).getValue()) || 245;
  sheet.getRange(2, 1).setValue(current + 1);
}
