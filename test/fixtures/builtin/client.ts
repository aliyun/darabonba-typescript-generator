// This file is auto-generated, don't edit it
import { Readable, Writable } from 'stream';
import * as $tea from '@alicloud/tea-typescript';


export default class Client {

  static async arrayTest(args: string[]): Promise<void> {
    if ((args.length > 0) && args.includes("cn-hanghzou")) {
      let index = args.indexOf("cn-hanghzou");
      let regionId : string = args[index];
      let all = args.join(",");
      let first = args.shift();
      let last = args.pop();
      let length1 = args.unshift(first);
      let length2 = args.push(last);
      let length3 : number = length1 + length2;
      let longStr = "long" + first + last;
      let fullStr = args.join(",");
      let newArr = [
        "test"
      ];
      let cArr : string[] = newArr.concat(args);
      let acsArr = $tea.sort(newArr, "acs");
      let descArr = $tea.sort(newArr, "desc");
      let llArr : string[] = acsArr.concat(descArr);
      llArr.splice(10, 0, "test");
      llArr.splice(llArr.indexOf("test"), 1);
    }

  }

  static async bytesTest(args: string[]): Promise<void> {
    let fullStr = args.join(",");
    let data = Buffer.from(fullStr, "utf8");
    let newFullStr = data.toString("utf8");
    if (fullStr != newFullStr) {
      return ;
    }

    let hexStr = data.toString("hex");
    let base64Str = data.toString("base64");
    let length : number = data.length;
    let obj = data.toString("utf8");
    let data2 = Buffer.from(fullStr, "base64");
  }

  static async dateTest(args: string[]): Promise<void> {
    let date = new $tea.Date("2023-09-12 17:47:31.916000 +0800 UTC");
    let dateStr = date.format("YYYY-MM-DD HH:mm:ss");
    let timestamp = date.unix();
    let yesterday = date.sub("day", 1);
    let oneDay = date.diff("day", yesterday);
    let tomorrow = date.add("day", 1);
    let twoDay = tomorrow.diff("day", date) + oneDay;
    let hour = date.hour();
    let minute = date.minute();
    let second = date.second();
    let dayOfMonth = date.dayOfMonth();
    let dayOfWeek = date.dayOfWeek();
    let weekOfMonth = date.weekOfMonth();
    let weekOfYear = date.weekOfYear();
    let month = date.month();
    let year = date.year();
  }

  static async envTest(args: string[]): Promise<void> {
    let es = process.env["TEST"];;
    let ma = process.env["TEST"] = es + "test";;
  }

  static async fileTest(args: string[]): Promise<void> {
    if (await $tea.File.exists("/tmp/test")) {
      let file = new $tea.File("/tmp/test");
      let path = file.path();
      let length = await file.length() + 10;
      let createTime = await file.createTime();
      let modifyTime = await file.modifyTime();
      let timeLong = modifyTime.diff("minute", createTime);
      let data = await file.read(300);
      await file.write(Buffer.from("test", "utf8"));
      let rs : Readable = $tea.File.createReadStream("/tmp/test");
      let ws : Writable = $tea.File.createWriteStream("/tmp/test");
    }

  }

  static async formTest(args: string[]): Promise<void> {
    let m = {
      key1: "test1",
      key2: "test2",
      key3: 3,
      key4: {
        key5: 123,
        key6: "321",
      },
    };
    let form = $tea.Form.toFormString(m);
    form = form + "&key7=23233&key8=" + $tea.Form.getBoundary();
    let r : Readable = $tea.Form.toFileForm(m, $tea.Form.getBoundary());
  }

  static async jsonTest(args: string[]): Promise<void> {
    let m = {
      key1: "test1",
      key2: "test2",
      key3: 3,
      key4: {
        key5: 123,
        key6: "321",
      },
    };
    let ms = JSON.stringify(m);
    let ma = JSON.parse(ms);
    let arrStr = "[1,2,3,4]";
    let arr = JSON.parse(arrStr);
  }

  static async logerTest(args: string[]): Promise<void> {
    console.log("test");
    console.info("test");
    console.warn("test");
    console.debug("test");
    console.error("test");
  }

  static async mapTestCase(args: string[]): Promise<void> {
    let mapTest = {
      key1: "value1",
      key2: "value2",
      key3: "value3",
    };
    let length = Object.keys(mapTest).length;
    let num = length + 3;
    let keys = Object.keys(mapTest);
    let allKey = "";

    for(let key of keys) {
      allKey = allKey + key;
    }
    let entries : [string, string][] = Object.entries(mapTest);
    let newKey = "";
    let newValue = "";

    for(let e of entries) {
      newKey = newKey + e[0];
      newValue = newValue + e[1];
    }
    let json = JSON.stringify(mapTest);
    let mapTest2 = {
      key1: "value4",
      key4: "value5",
    };
    let mapTest3 = $tea.merge(mapTest , mapTest2);
    if (mapTest3["key1"] == "value4") {
      return ;
    }

  }

  static async numberTest(args: string[]): Promise<void> {
    let num = 3.2;
    let inum : number = parseInt(`${num}`);
    let lnum : number = parseInt(`${num}`);
    let fnum : number = parseFloat(`${num}`);
    let dnum : number = parseFloat(`${num}`);
    inum = parseInt(`${inum}`);
    lnum = parseInt(`${inum}`);
    fnum = parseFloat(`${inum}`);
    dnum = parseFloat(`${inum}`);
    inum = parseInt(`${lnum}`);
    lnum = parseInt(`${lnum}`);
    fnum = parseFloat(`${lnum}`);
    dnum = parseFloat(`${lnum}`);
    inum = parseInt(`${fnum}`);
    lnum = parseInt(`${fnum}`);
    fnum = parseFloat(`${fnum}`);
    dnum = parseFloat(`${fnum}`);
    inum = parseInt(`${dnum}`);
    lnum = parseInt(`${dnum}`);
    fnum = parseFloat(`${dnum}`);
    dnum = parseFloat(`${dnum}`);
    lnum = inum;
    inum = lnum;
    let randomNum = Math.random();
    inum = Math.floor(inum);
    inum = Math.round(inum);
    let min = Math.min(inum, fnum);
    let max = Math.max(inum, fnum);
  }

  static async streamTest(args: string[]): Promise<void> {
    if (await $tea.File.exists("/tmp/test")) {
      let rs : Readable = $tea.File.createReadStream("/tmp/test");
      let ws : Writable = $tea.File.createWriteStream("/tmp/test");
      let data = rs.read(30);
      ws.write(data);
      rs.pipe(ws);
      data = await $tea.Stream.readAsBytes(rs);
      let obj = await $tea.Stream.readAsJSON(rs);
      let jsonStr = await $tea.Stream.readAsString(rs);
    }

  }

  static async stringTest(args: string[]): Promise<void> {
    let fullStr = args.join(",");
    args = fullStr.split(",");
    if ((fullStr.length > 0) && fullStr.includes("hangzhou")) {
      let newStr1 = fullStr.replace(/hangzhou/g, "beijing");
    }

    if (fullStr.startsWith("cn")) {
      let newStr2 = fullStr.replace(/cn/gi, "zh");
    }

    if (fullStr.startsWith("beijing")) {
      let newStr3 = fullStr.replace(/beijing/, "chengdu");
    }

    let start = fullStr.indexOf("beijing");
    let end = start + 7;
    let region = fullStr.slice(start, end);
    let lowerRegion = region.toLowerCase();
    let upperRegion = region.toUpperCase();
    if (region == "beijing") {
      region = region + " ";
      region = region.trim();
    }

    let tb : Buffer = Buffer.from(fullStr, "utf8");
    let em = "xxx";
    if (!em) {
      return ;
    }

    let num = "32.0a";
    let inum = parseInt(num) + 3;
    let lnum : number = parseInt(num);
    let fnum : number = parseFloat(num) + 1;
    let dnum : number = parseFloat(num) + 1;
  }

  static async urlTest(args: string[]): Promise<void> {
    let url = new $tea.URL(args[0]);
    let path = url.path();
    let pathname = url.pathname();
    let protocol = url.protocol();
    let hostname = url.hostname();
    let port = url.port();
    let host = url.host();
    let hash = url.hash();
    let search = url.search();
    let href = url.href();
    let auth = url.auth();
    let url2 = $tea.URL.parse(args[1]);
    path = url2.path();
    let newUrl = $tea.URL.urlEncode(args[2]);
    let newSearch = $tea.URL.percentEncode(search);
    let newPath = $tea.URL.pathEncode(pathname);
    let all = "test" + path + protocol + hostname + hash + search + href + auth + newUrl + newSearch + newPath;
  }

  static async xmlTest(args: string[]): Promise<void> {
    let m = {
      key1: "test1",
      key2: "test2",
      key3: 3,
      key4: {
        key5: 123,
        key6: "321",
      },
    };
    let xml = $tea.XML.toXML(m);
    xml = xml + "<key7>132</key7>";
    let respMap : {[key: string ]: any} = $tea.XML.parseXml(xml, null);
  }

  static returnAny(): any {
    throw new Error('Un-implemented!');
  }

  static async main(args: string[]): Promise<void> {
    await Client.arrayTest(args);
    await Client.bytesTest(args);
    await Client.dateTest(args);
    await Client.envTest(args);
    await Client.fileTest(args);
    await Client.formTest(args);
    await Client.logerTest(args);
    await Client.mapTestCase(args);
    await Client.numberTest(args);
    await Client.streamTest(args);
    await Client.stringTest(args);
    await Client.urlTest(args);
    await Client.xmlTest(args);
    let a : number = parseInt(args[0]) + 10;
    let b : string = String(a) + args[1] + String(Client.returnAny());
    let c : number = Number(b) + Number(a) + Number(Client.returnAny());
    let d : number = parseInt(b) + parseInt(a) + parseInt(Client.returnAny());
    let e : number = parseInt(b) + parseInt(a) + parseInt(Client.returnAny());
    let f : number = parseInt(b) + parseInt(a) + parseInt(Client.returnAny());
    let g : number = parseInt(b) + parseInt(a) + parseInt(Client.returnAny());
    let h : number = parseInt(b) + parseInt(a) + parseInt(Client.returnAny());
    let i : number = parseInt(b) + parseInt(a) + parseInt(Client.returnAny());
    let j : number = parseInt(b) + parseInt(a) + parseInt(Client.returnAny());
    let k : number = parseInt(b) + parseInt(a) + parseInt(Client.returnAny());
    let l : number = parseInt(b) + parseInt(a) + parseInt(Client.returnAny());
    let m : number = parseInt(b) + parseInt(a) + parseInt(Client.returnAny());
    let n : number = parseFloat(b) + parseFloat(a) + parseFloat(Client.returnAny());
    let o : number = parseFloat(b) + parseFloat(a) + parseFloat(Client.returnAny());
    if (Boolean(args[2])) {
      let data = Buffer.from(Client.returnAny());
      let length : number = data.length;
      let test : any = data;
      let maps : {[key: string ]: string} = {
        key: "value",
      };
      let obj : {[key: string]: any} = maps;
      let ws = Writable.from(obj);
      let rs = Readable.from(maps);
      data = rs.read(30);
      if (!$tea.isNull(data)) {
        ws.write(data);
      }

    }

    $tea.sleep(a);
    let defaultVal = String(args[0] || args[1]);
    if (defaultVal === b) {
      return ;
    }

  }

}
