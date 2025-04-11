# client-vector-search

A client side vector search library that can embed, search, and cache. Works on the browser and server side.

It outperforms OpenAI's text-embedding-ada-002 and is way faster than Pinecone and other VectorDBs.

I'm the founder of [searchbase.app](https://searchbase.app) and we needed this for our product and customers. We'll be using this library in production. You can be sure it'll be maintained and improved.

- Embed documents using transformers by default: gte-small (~30mb).
- Calculate cosine similarity between embeddings.
- Create an index and search on the client side
- Cache vectors with browser caching support.

Lots of improvements are coming!

## Roadmap

Our goal is to build a super simple, fast vector search that works with couple hundred to thousands vectors. ~1k vectors per user covers 99% of the use cases.

We'll initially keep things super simple and sub 100ms

### TODOs

- [ ] add HNSW index that works on node and browser env, don't rely on hnsw binder libs
- [ ] add a proper testing suite and ci/cd for the lib
  - [ ] simple health tests
    - [ ] mock the @xenova/transformers for jest, it's not happy with it
  - [ ] performance tests, recall, memory usage, cpu usage etc.

## Installation

```bash
npm i client-vector-search
```

## Quickstart

This library provides a plug-and-play solution for embedding and vector search. It's designed to be easy to use, efficient, and versatile. Here's a quick start guide:

```ts
import { getEmbedding, EmbeddingIndex } from 'client-vector-search';

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
  //   indexedDBName: 'clientVectorDB',
  //   indexedDBObjectStoreName: 'ClientEmbeddingStore',
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
import { initializeModel } from "client-vector-search"
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
  DBName: 'clientVectorDB',
  objectStoreName: 'ClientEmbeddingStore',
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
    indexedDBName: 'clientVectorDB',
    indexedDBObjectStoreName: 'ClientEmbeddingStore'
  }
});

---

### Delete Database
To delete an entire database.

```ts
await IndexedDbManager.deleteIndexedDB("clientVectorDB");
````

---

### Delete Object Store

To delete an object store from a database.

```ts
await IndexedDbManager.deleteIndexedDBObjectStore(
  'clientVectorDB',
  'ClientEmbeddingStore',
);
```

---

### Retrieve All Objects

To retrieve all objects from a specific object store.

```ts
const allObjects = await IndexedDbManager.getAllObjectsFromIndexedDB(
  'clientVectorDB',
  'ClientEmbeddingStore',
);
```
