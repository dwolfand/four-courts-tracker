
const dynamodb = require('./dynamodb');

module.exports.getRefreshTokenCache = async function getRefreshTokenCache() {
    const params = {
        TableName: process.env.DYNAMODB_TABLE,
        Key: {
            id: 'refreshTokens',
        },
    };
    
      // fetch todo from the database
    return dynamodb.get(params).promise()
    .then((result) => {
        return result.Item;
    });
}

module.exports.updateRefreshTokenCache = async function getRefreshTokenCache(tokens) {
    const params = {
        TableName: process.env.DYNAMODB_TABLE,
        Key: {
            id: 'refreshTokens',
        },
        ExpressionAttributeValues: {
            ':tokens': tokens,
        },
        UpdateExpression: 'SET tokens = :checked',
        ReturnValues: 'ALL_NEW',
    };
    
      // fetch todo from the database
    return dynamodb.update(params).promise()
    .then((result) => {
        return result.Attributes;
    });
}