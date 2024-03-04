<template>
  <table>
    <thead>
      <button @click="sortByName">Sort by Name</button>
      <button @click="sortByType">Sort by Type</button>
      <tr>
        <th v-for="header in headers">{{ header }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in sortedRows">
        <td v-for="value in row">{{ value }}</td>
      </tr>
    </tbody>
  </table>
</template>
<script>
export default {
  props: {
    csvData: {
      type: String,
      required: false,
    },
  },
  data() {
    return {
      csvData: `Name,Type,By,Anbefalt av,Besøkt dato,Lokasjon,Hjemmeside,KoblingKalender,🍷 Fått av drikke
Maaemo,Fine Dining,Oslo,,Maaemo,23 Dronning Eufemias gate,,Maaemo (https://www.notion.so/Maaemo-c52c85baede84056ba2393ef1738744d?pvs=21),
Brasserie blanche,Restaurant,Oslo,,,,,,
Norvald vinbar,Vinbar,Stavanger,,Predrink Stavanger,"Øvre Holmegate 3, 4006 Stavanger",,Predrink Stavanger (https://www.notion.so/Predrink-Stavanger-0320d96e25de4449bce5c2a33de44ef7?pvs=21),Testalonga Colombard - I wish I was a ninja (https://www.notion.so/Testalonga-Colombard-I-wish-I-was-a-ninja-3c4265d4002b491192fa27d1ac75ada4?pvs=21)
Abelone,"Casual, Restaurant, Uteservering",Oslo,,,https://abeloneoslo.no/kontakt-oss/,https://abeloneoslo.no/,,
Ahaan,"Afternoon Tea, Restaurant",Oslo,,SommerDate,"Sommerrogata 1, 0255 Oslo",http://ahaan.no/,SommerDate (https://www.notion.so/SommerDate-46ece6b54bb148b28d47a3a56c1eb965?pvs=21),Acham-Magin Forster Pechstein Riesling GG 2020 (https://www.notion.so/Acham-Magin-Forster-Pechstein-Riesling-GG-2020-4ae3abd91bfa46459e458cc9a5ba617a?pvs=21)
Apostrophe,"Japansk, Restaurant",Oslo,,,"Kirkegårdsgata 7A, 0558 Oslo",restaurant-apostrophe.com,,`,
    };
  },

  computed: {
    /*
    headers() {
      return this.csvData
        .slice(0, this.csvData.indexOf("\n"))
        .split(",")
        .map((h) => h.trim());
    },
    rows() {
      const rows = this.csvData
        .slice(this.csvData.indexOf("\n") + 1)
        .split("\n");
      return rows.map((row) => {
        const values = row.split(",");
        return values.map((v) => v.trim());
      });
    },
  },*/
    // Parse CSV data and extract headers and rows
    headers() {
      return this.csvData.trim().split("\n")[0].split(",");
    },
    rows() {
      const dataRows = this.csvData.trim().split("\n").slice(1);
      return dataRows.map((row) => row.split(","));
    },
    sortedRows() {
      return this.rows.slice().sort((a, b) => a[0].localeCompare(b[0]));
    },
    sortedRowsByType() {
      return this.rows.slice().sort((a, b) => a[1].localeCompare(b[1]));
    },
  },
  methods: {
    sortByName() {
      this.sortedRows;
      console.log("sorted");
    },
    sortByType() {
      this.sortedRowsByType;
    },
  },
};
</script>
<style>
table {
  border-collapse: collapse;
  width: 100%;
  margin-top: 20px;
}
th,
td {
  border: 1px solid #dddddd;
  text-align: left;
  padding: 8px;
}
th {
  background-color: #f2f2f2;
}
button {
  margin-top: 10px;
}
</style>
