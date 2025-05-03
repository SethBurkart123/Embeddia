# Embeddia

> A high-performance, client-side vector search library designed for use in [BetterSEQTA+](https://github.com/betterseqta/betterseqta-plus). This is a maintained fork of `client-vector-search`.

---

**Embeddia** is a lightweight and fast client-side vector search library that can embed, search, and cache vectors in both the browser and Node.js environments. It includes performance improvements like preloading and IndexedDB caching.

It outperforms OpenAI's `text-embedding-ada-002` in real-world use cases and is significantly faster than traditional VectorDBs like Pinecone — ideal for scenarios where each user has hundreds to thousands of embeddings.

---

## Key Features

- Fast, local vector search (under 100ms)
- Built-in embedding generator
- Works in browser and Node.js
- Persistent IndexedDB support
- Preloading & caching
- Easy to use and extend

---

## Installation

```bash
npm i embeddia
```

## Quickstart

This library provides a plug-and-play solution for embedding and vector search. It's designed to be easy to use, efficient, and versatile. Here's a quick start guide:

```ts
import { getEmbedding, EmbeddingIndex } from 'embeddia';

// getEmbedding is an async function, so you need to use 'await' or '.then()' to get the result
const embedding = await getEmbedding('Apple'); // Returns embedding as number[]

// Each object should have an 'embedding' property of type number[]
const initialObjects = [
  { id: 1, name: 'Apple', embedding: embedding },
  { id: 2, name: 'Banana', embedding: await getEmbedding('Banana') },
  { id: 3, name: 'Cheddar', embedding: await getEmbedding('Cheddar') },
  { id: 4, name: 'Space', embedding: await getEmbedding('Space') },
  { id: 5, name: 'database', embedding: await getEmbedding('database') },
];
const index = new EmbeddingIndex(initialObjects); // Creates an index

// The query should be an embedding of type number[]
const queryEmbedding = await getEmbedding('Fruit'); // Query embedding
const results = await index.search(queryEmbedding, { topK: 5 }); // Returns top similar objects

// specify the storage type
await index.saveIndex('indexedDB');
const results = await index.search([1, 2, 3], {
  topK: 5,
  useStorage: 'indexedDB',
  // storageOptions: { // use only if you overrode the defaults
  //   indexedDBName: 'embeddiaDB',
  //   indexedDBObjectStoreName: 'embeddiaObjectStore',
  // },
});

console.log(results);

await index.deleteIndexedDB(); // if you overrode default, specify db name
```

## Trouble-shooting

### NextJS

To use it inside NextJS projects you'll need to update the `next.config.js` file to include the following:

```js
module.exports = {
  // Override the default webpack configuration
  webpack: (config) => {
    // See https://webpack.js.org/configuration/resolve/#resolvealias
    config.resolve.alias = {
      ...config.resolve.alias,
      sharp$: false,
      'onnxruntime-node$': false,
    };
    return config;
  },
};
```

#### Model load after page is loaded

You can initialize the model before using it to generate embeddings. This will ensure that the model is loaded before you use it and provide a better UX.

```js
import { initializeModel } from "embeddia"
...
  useEffect(() => {
    try {
      initializeModel();
    } catch (e) {
      console.log(e);
    }
  }, []);
```

## Usage Guide

This guide provides a step-by-step walkthrough of the library's main features. It covers everything from generating embeddings for a string to performing operations on the index such as adding, updating, and removing objects. It also includes instructions on how to save the index to a database and perform search operations within it.

Until we have a reference documentation, you can find all the methods and their usage in this guide. Each step is accompanied by a code snippet to illustrate the usage of the method in question. Make sure to follow along and try out the examples in your own environment to get a better understanding of how everything works.

Let's get started!

### Step 1: Generate Embeddings for String

Generate embeddings for a given string using the `getEmbedding` method.

```ts
const embedding = await getEmbedding('Apple'); // Returns embedding as number[]
```

> **Note**: `getEmbedding` is asynchronous; make sure to use `await`.

---

### Step 2: Calculate Cosine Similarity

Calculate the cosine similarity between two embeddings.

```ts
const similarity = cosineSimilarity(embedding1, embedding2, 6);
```

> **Note**: Both embeddings should be of the same length.

---

### Step 3: Create an Index

Create an index with an initial array of objects. Each object must have an 'embedding' property.

```ts
const initialObjects = [...];
const index = new EmbeddingIndex(initialObjects);
```

---

### Step 4: Add to Index

Add an object to the index.

```ts
const objectToAdd = {
  id: 6,
  name: 'Cat',
  embedding: await getEmbedding('Cat'),
};
index.add(objectToAdd);
```

---

### Step 5: Update Index

Update an existing object in the index.

```ts
const vectorToUpdate = {
  id: 6,
  name: 'Dog',
  embedding: await getEmbedding('Dog'),
};
index.update({ id: 6 }, vectorToUpdate);
```

---

### Step 6: Remove from Index

Remove an object from the index.

```ts
index.remove({ id: 6 });
```

---

### Step 7: Retrieve from Index

Retrieve an object from the index.

```ts
const vector = index.get({ id: 1 });
```

---

### Step 8: Search the Index

Search the index with a query embedding.

```ts
const queryEmbedding = await getEmbedding('Fruit');
const results = await index.search(queryEmbedding, { topK: 5 });
```

---

### Step 9: Print the Index

Print the entire index to the console.

```ts
index.printIndex();
```

---

### Step 10: Save Index to IndexedDB (for browser)

Save the index to a persistent IndexedDB database. Note

```ts
await index.saveIndex('indexedDB', {
  DBName: 'embeddiaDB',
  objectStoreName: 'embeddiaObjectStore',
});
```

---

### Important: Search in indexedDB

Perform a search operation in the IndexedDB.

````ts
const results = await index.search(queryEmbedding, {
  topK: 5,
  useStorage: "indexedDB",
  storageOptions: { // only if you want to override the default options, defaults are below
    indexedDBName: 'embeddiaDB',
    indexedDBObjectStoreName: 'embeddiaObjectStore'
  }
});

---

### Delete Database
To delete an entire database.

```ts
await IndexedDbManager.deleteIndexedDB("embeddiaDB");
````

---

### Delete Object Store

To delete an object store from a database.

```ts
await IndexedDbManager.deleteIndexedDBObjectStore(
  'embeddiaDB',
  'embeddiaObjectStore',
);
```

---

### Retrieve All Objects

To retrieve all objects from a specific object store.

```ts
const allObjects = await IndexedDbManager.getAllObjectsFromIndexedDB(
  'embeddiaDB',
  'embeddiaObjectStore',
);
```
