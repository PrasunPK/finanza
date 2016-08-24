var manager = {
    verifyUser: function (client, username, password) {
        var querySync = client.querySync('SELECT * FROM user_details where name = $1 and password = $2', [username, password]);
        return querySync.length == 1;
    },

    getBalances: function (client) {
        var result = client.querySync('SELECT * FROM expense_income_turnover order by updated_at DESC limit 1');
        return result;
    },

    getCompanies: function (client) {
        var result = client.querySync('SELECT name, nick_name, other_detail FROM company_details order by updated_at');
        return result;
    },

    getCompanyDetail: function (client, nickName) {
        var result = client.querySync('SELECT name, propeitor_name, address, phone_number FROM company_details where nick_name = $1', [companyNickName]);
        return result;
    },

    getExpenses: function (client) {
        var result = client.querySync('SELECT * FROM stagging.expenses');
        return result;
    },

    getRole: function (client, name) {
        var result = client.querySync('select role from user_details where name = $1', [name]);
        return result[0];
    }
};

module.exports = manager;


