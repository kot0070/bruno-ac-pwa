(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.BrunoFinancial = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function finiteNumber(value) {
    if (value === null || value === undefined || value === '') return null;
    var n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  function optionalNonNegative(value, defaultValue) {
    if (value === null || value === undefined || value === '') return defaultValue;
    return nonNegative(value);
  }

  function nonNegative(value) {
    var n = finiteNumber(value);
    return n !== null && n >= 0 ? n : null;
  }

  function validProfitMargin(value) {
    var n = finiteNumber(value);
    return n !== null && n >= 0 && n < 1 ? n : null;
  }

  function methodASales(cost, overhead, profit) {
    var c = nonNegative(cost);
    var oh = nonNegative(overhead);
    var pm = validProfitMargin(profit);
    if (c === null) return { ok: false, value: null, error: 'Cost must be finite and nonnegative.' };
    if (oh === null) return { ok: false, value: null, error: 'Overhead must be finite and nonnegative.' };
    if (pm === null) return { ok: false, value: null, error: 'Profit margin must be finite and at least 0% but less than 100%.' };
    var value = c * (1 + oh) / (1 - pm);
    if (!Number.isFinite(value)) return { ok: false, value: null, error: 'Method A produced a non-finite result.' };
    return { ok: true, value: value, error: '' };
  }

  var INVALID_FINANCIAL = 'INVALID_FINANCIAL';
  var INVALID_EXPLICIT_LABOR = 'INVALID_EXPLICIT_LABOR';

  function normalizePersistentFinancial(value, defaultValue) {
    if (value === INVALID_FINANCIAL) return INVALID_FINANCIAL;
    if (value === null || value === undefined || value === '') return defaultValue;
    var n = Number(value);
    return Number.isFinite(n) && n >= 0 ? n : INVALID_FINANCIAL;
  }

  function normalizeExplicitLaborValue(value, defaultValue) {
    if (value === 'INVALID_LEGACY_LABOR' || value === INVALID_EXPLICIT_LABOR) return value;
    if (value === null || value === undefined || value === '') return defaultValue === undefined ? 0 : defaultValue;
    var n = Number(value);
    return Number.isFinite(n) && n >= 0 ? n : INVALID_EXPLICIT_LABOR;
  }

  function laborCost(input) {
    input = input || {};
    var straightRate = nonNegative(input.straightRate);
    var straightHours = nonNegative(input.straightHours);
    var ot15Hours = nonNegative(input.ot15Hours);
    var ot2Hours = nonNegative(input.ot2Hours);
    var holidayHours = nonNegative(input.holidayHours);
    var holidayMultiplier = nonNegative(input.holidayMultiplier == null ? 3 : input.holidayMultiplier);
    if ([straightRate, straightHours, ot15Hours, ot2Hours, holidayHours, holidayMultiplier].some(function (x) { return x === null; })) {
      return { ok: false, cost: null, totalHours: null, error: 'Labor rates, multipliers, and hours must be finite and nonnegative.' };
    }
    var cost = straightHours * straightRate + ot15Hours * straightRate * 1.5 + ot2Hours * straightRate * 2 + holidayHours * straightRate * holidayMultiplier;
    return {
      ok: Number.isFinite(cost),
      cost: Number.isFinite(cost) ? cost : null,
      totalHours: straightHours + ot15Hours + ot2Hours + holidayHours,
      rates: { straight: straightRate, ot15: straightRate * 1.5, ot2: straightRate * 2, holiday: straightRate * holidayMultiplier },
      error: Number.isFinite(cost) ? '' : 'Labor cost is non-finite.'
    };
  }


  function migrateLegacyLaborBlock(block) {
    block = block || {};
    function legacyNumber(value) {
      if (value === null || value === undefined || value === '') return 0;
      var n = Number(value);
      return Number.isFinite(n) && n >= 0 ? n : null;
    }

    var persons = legacyNumber(block.persons);
    var days = legacyNumber(block.days);
    var hoursPerDay = legacyNumber(block.hoursPerDay);
    var satPersons = legacyNumber(block.satPersons);
    var satDays = legacyNumber(block.satDays);
    var satHours = legacyNumber(block.satHours);
    var sunPersons = legacyNumber(block.sunPersons);
    var sunDays = legacyNumber(block.sunDays);
    var sunHours = legacyNumber(block.sunHours);
    var values = [persons, days, hoursPerDay, satPersons, satDays, satHours, sunPersons, sunDays, sunHours];

    if (values.some(function (v) { return v === null; })) {
      return {
        ok: false,
        straightHours: 'INVALID_LEGACY_LABOR',
        ot15Hours: 'INVALID_LEGACY_LABOR',
        ot2Hours: 'INVALID_LEGACY_LABOR',
        holidayHours: 0,
        holidayMultiplier: 3,
        laborModelVersion: 2,
        error: 'Malformed legacy labor values require correction before pricing.'
      };
    }

    return {
      ok: true,
      straightHours: persons * days * Math.min(hoursPerDay, 8),
      ot15Hours: persons * days * Math.max(hoursPerDay - 8, 0) + satPersons * satDays * satHours,
      ot2Hours: sunPersons * sunDays * sunHours,
      holidayHours: 0,
      holidayMultiplier: 3,
      laborModelVersion: 2,
      error: ''
    };
  }

  function recoveryRate(input) {
    input = input || {};
    var purchase = nonNegative(input.purchaseCost);
    var residual = optionalNonNegative(input.residualValue, 0);
    var lifeHours = finiteNumber(input.lifeHours);
    var maintenance = optionalNonNegative(input.maintenancePerHour, 0);
    var other = optionalNonNegative(input.otherPerHour, 0);
    if (purchase === null || residual === null || lifeHours === null || lifeHours <= 0 || maintenance === null || other === null) {
      return { ok: false, rate: null, ownershipRate: null, error: 'Recovery inputs must be finite; productive life must be greater than zero.' };
    }
    if (residual > purchase) return { ok: false, rate: null, ownershipRate: null, error: 'Residual value cannot exceed purchase cost.' };
    var ownershipRate = (purchase - residual) / lifeHours;
    var rate = ownershipRate + maintenance + other;
    return { ok: Number.isFinite(rate), rate: Number.isFinite(rate) ? rate : null, ownershipRate: ownershipRate, error: '' };
  }

  function toolJobCost(line) {
    line = line || {};
    var cls = String(line.costClass || 'LEGACY_DIRECT').toUpperCase();
    if (cls === 'SHOP_OVERHEAD_TOOL') return { ok: true, cost: 0, rate: 0, formula: 'Company OH — no direct job charge.' };
    if (cls === 'CONSUMABLE' || cls === 'RENTAL' || cls === 'LEGACY_DIRECT') {
      var qty = nonNegative(line.qty);
      var unit = nonNegative(line.unitCost);
      if (qty === null || unit === null) return { ok: false, cost: null, rate: null, formula: '', error: 'Quantity and direct cost must be finite and nonnegative.' };
      return { ok: true, cost: qty * unit, rate: unit, formula: 'qty × direct unit cost' };
    }
    if (cls === 'REUSABLE_TOOL' || cls === 'MAJOR_EQUIPMENT') {
      var unitName = String(line.recoveryUnit || 'hour').toLowerCase();
      var usage = optionalNonNegative(line.usage, 0);
      if (usage === null) return { ok: false, cost: null, rate: null, formula: '', error: 'Usage must be finite and nonnegative.' };
      if (unitName === 'day') {
        var daily = nonNegative(line.dailyRecoveryRate);
        if (daily === null) return { ok: false, cost: null, rate: null, formula: '', error: 'Daily recovery rate must be finite and nonnegative.' };
        return { ok: true, cost: daily * usage, rate: daily, formula: 'daily recovery × days used' };
      }
      var rr = recoveryRate({
        purchaseCost: line.purchaseCost != null ? line.purchaseCost : line.unitCost,
        residualValue: line.residualValue,
        lifeHours: line.lifeHours,
        maintenancePerHour: line.maintenancePerHour,
        otherPerHour: line.otherPerHour
      });
      if (!rr.ok) return { ok: false, cost: null, rate: null, formula: '', error: rr.error };
      return { ok: true, cost: rr.rate * usage, rate: rr.rate, ownershipRate: rr.ownershipRate, formula: '((purchase − residual) / productive life h + maintenance/h + other/h) × usage h' };
    }
    return { ok: false, cost: null, rate: null, formula: '', error: 'Unknown tool cost class.' };
  }

  function approvedChangeOrders(list) {
    var total = 0;
    var valid = true;
    (list || []).forEach(function (row) {
      if (String((row || {}).status || '').toLowerCase() !== 'approved') return;
      var n = nonNegative(row.amount);
      if (n === null) { valid = false; return; }
      total += n;
    });
    return valid ? total : null;
  }

  function quotedContractRevenue(baseQuote, changeOrders) {
    var base = nonNegative(baseQuote);
    var approved = approvedChangeOrders(changeOrders);
    if (base === null || approved === null) return null;
    return base + approved;
  }

  function tmTotal(tm) {
    tm = tm || {};
    var equip = 0, labor = 0, valid = true;
    (tm.equipmentLines || []).forEach(function (r) {
      var q = nonNegative(r.qty), rate = nonNegative(r.rate);
      if (q === null || rate === null) { valid = false; return; }
      equip += q * rate;
    });
    (tm.laborLines || []).forEach(function (r) {
      var h = nonNegative(r.hours), rate = nonNegative(r.rate);
      if (h === null || rate === null) { valid = false; return; }
      labor += h * rate;
    });
    var material = nonNegative(tm.materialAmount);
    var sub = nonNegative(tm.subAmount);
    if (!valid || material === null || sub === null) return { ok: false, equip: null, labor: null, material: null, sub: null, total: null, error: 'All T&M rows must be finite and nonnegative.' };
    return { ok: true, equip: equip, labor: labor, material: material, sub: sub, total: equip + labor + material + sub, error: '' };
  }

  function validateAcrCompany(company) {
    company = company || {};
    var missing = [];
    var legalName = String(company.legalName || company.name || '').trim();
    var address1 = String(company.address1 || company.address || '').trim();
    var city = String(company.city || '').trim();
    var state = String(company.state || '').trim();
    var zip = String(company.zip || '').trim();
    var phone = String(company.phone || '').trim();
    var license = String(company.acrLicense || '').trim();
    if (!legalName) missing.push('company legal/business name');
    if (!address1 || !city || !state || !zip) missing.push('company address');
    if (!phone) missing.push('company phone');
    if (!license) missing.push('ACR contractor license number');
    return { ok: missing.length === 0, missing: missing };
  }

  return {
    finiteNumber: finiteNumber,
    nonNegative: nonNegative,
    validProfitMargin: validProfitMargin,
    methodASales: methodASales,
    laborCost: laborCost,
    normalizePersistentFinancial: normalizePersistentFinancial,
    normalizeExplicitLaborValue: normalizeExplicitLaborValue,
    INVALID_FINANCIAL: INVALID_FINANCIAL,
    INVALID_EXPLICIT_LABOR: INVALID_EXPLICIT_LABOR,
    migrateLegacyLaborBlock: migrateLegacyLaborBlock,
    recoveryRate: recoveryRate,
    toolJobCost: toolJobCost,
    approvedChangeOrders: approvedChangeOrders,
    quotedContractRevenue: quotedContractRevenue,
    tmTotal: tmTotal,
    validateAcrCompany: validateAcrCompany
  };
});
