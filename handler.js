const AWS = require("aws-sdk");
const DynamoDB = require("aws-sdk/clients/dynamodb");
const DocumentClient = new DynamoDB.DocumentClient({ region: "us-east-2" });

const isBookAvailable = (book, quantity) => {
  return book.quantity - quantity;
};

const checkInventory = async ({ bookId, quantity }) => {
  try {
    let params = {
      TableName: "bookTable",
      KeyConditionExpression: "bookId = :bookId",
      ExpressionAttributeValues: {
        ":bookId": bookId,
      },
    };

    let result = await DocumentClient.query(params).promise();
    const book = result.Items[0];

    if (isBookAvailable(book, quantity)) {
      return book;
    } else {
      let bookOutOfStockError = new Error("The book is out of stock");
      bookOutOfStockError.name = "BookOutOfStock";
      throw bookOutOfStockError;
    }
  } catch (error) {
    if (error.name === "BookOutOfStock") {
      throw error;
    } else {
      let bookNotFoundError = new Error(error);
      bookNotFoundError.name = "BookNotFound";
      throw bookNotFoundError;
    }
  }
};

const calculateTotal = async ({ book, quantity }) => {
  const total = book.price * quantity;
  return { total };
};

module.exports = { checkInventory, calculateTotal };
