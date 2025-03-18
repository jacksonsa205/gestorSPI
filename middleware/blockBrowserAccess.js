const blockBrowserAccess = (req, res, next) => {
    const acceptHeader = req.headers.accept || '';
  
    if (acceptHeader.includes('text/html')) {
      return res.status(403).json({ error: 'Acesso negado. Requisições diretas pelo navegador não são permitidas.' });
    }
  
    next();
  };
  
  module.exports = blockBrowserAccess;