const dynamodb = require('./dynamodb');

module.exports.getTokenCache = async function getTokenCache() {
    const params = {
        TableName: process.env.DYNAMODB_TABLE,
        Key: {
            id: 'fourCourtsTokens',
        },
    };
    
    return dynamodb.get(params).promise()
    .then((result) => {
        console.log('Whats the token cache?', JSON.stringify(result, null, ' '));
        return result.Item;
    });
}

module.exports.updateTokenCache = async function updateTokenCache(entry) {
    const timestamp = new Date().getTime();
    const params = {
        TableName: process.env.DYNAMODB_TABLE,
        Key: {
            id: 'fourCourtsTokens',
        },
        ExpressionAttributeNames: {
            '#email': entry.email,
        },
        ExpressionAttributeValues: {
            ':updatedAt': timestamp,
            ':info': {
                isDeleted: entry.isDeleted,
                token: entry.token,
                email: entry.email
            },
        },
        UpdateExpression: 'SET #email = :info, updatedAt = :updatedAt',
        ReturnValues: 'ALL_NEW',
    };
    
    return dynamodb.update(params).promise()
    .then((result) => {
        return result.Attributes;
    });
}