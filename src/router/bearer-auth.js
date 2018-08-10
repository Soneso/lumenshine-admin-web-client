module.exports = {
  request (req, token) {
    this.options.http._setHeaders.call(this, req, { Authorization: 'Bearer ' + token });
  },

  response (res) {
    console.log('1');
    const headers = this.options.http._getHeaders.call(this, res);
    let token = headers.Authorization || headers.authorization;
    console.log('got token' + token);

    if (token) {
      token = token.split(/Bearer:?\s?/i);
      console.log('returning:' + token[token.length > 1 ? 1 : 0].trim());
      return token[token.length > 1 ? 1 : 0].trim();
    }
  }
};
