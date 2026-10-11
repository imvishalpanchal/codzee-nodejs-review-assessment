const SUCCESS_STATUS_CODES = [200, 201, 202, 203, 204, 205, 206, 207, 208, 226];

const getMeta = (params, totalRecords) => {
  let { page, limit } = params || {};
  page = page !== undefined && page !== null ? parseInt(page, 10) : 1;
  limit = limit !== undefined && limit !== null ? parseInt(limit, 10) : 10;
  const totalPages = Math.ceil(totalRecords / limit) || 0;
  return {
    limit,
    currentPage: page,
    totalPages,
    totalRecords,
    itemsPerPage: limit,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1
  };
};

const ApiResponse = {
  details: (res, code = 200, message = 'Success', data = null) => {
    if (!SUCCESS_STATUS_CODES.includes(code)) {
      const request = res.req || {};
      const error = {
        url: request.originalUrl || request.url,
        method: request.method,
        message,
        code
      };
      return res.status(code).json({ error });
    }

    const result = {
      success: true,
      ...(message ? { message } : {})
    };
    if (data !== null && data !== undefined) {
      result.response = data;
    }
    return res.status(code).json(result);
  },

  list: (res, code = 200, data, params, total, message = 'Success') => {
    if (!SUCCESS_STATUS_CODES.includes(code)) {
      const request = res.req || {};
      const error = {
        url: request.originalUrl || request.url,
        method: request.method,
        message,
        code
      };
      return res.status(code).json({ error });
    }

    const metaObj = getMeta(params, total);
    const result = {
      success: true,
      message,
      response: {}
    };
    if (metaObj) {
      result.response.meta = metaObj;
    }
    if (data) {
      result.response.list = data;
    }
    return res.status(code).json(result);
  }
};

module.exports = ApiResponse;
