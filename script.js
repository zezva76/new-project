

function calcWatt() {
  let u = Number(document.getElementById("u1").value);
  let i = Number(document.getElementById("i1").value);

  if (!u || !i) return;

  document.getElementById("wattRes").innerHTML =
    (u * i).toFixed(2) + " W";
}



function calcAmp() {
  let u = Number(document.getElementById("u2").value);
  let p = Number(document.getElementById("p2").value);

  if (!u || !p) return;

  document.getElementById("ampRes").innerHTML =
    (p / u).toFixed(2) + " A";
}

function calcCable() {
  let P = Number(document.getElementById("load").value);
  if (!P) return;

  let U = 220;
  let I = P / U;

  let cable, breaker;

  if (I <= 10) {
    cable = "1.5 mm²";
    breaker = "B10";
  } else if (I <= 16) {
    cable = "2.5 mm²";
    breaker = "C16";
  } else if (I <= 25) {
    cable = "4 mm²";
    breaker = "C25";
  } else {
    cable = "6 mm²";
    breaker = "C32";
  }

  document.getElementById("cableRes").innerHTML =
    "Current: " + I.toFixed(1) + " A<br>" +
    "Recommended Cable: <b>" + cable + "</b><br>" +
    "Breaker: <b>" + breaker + "</b>";
}

function calcSection() {
  let P = parseFloat(document.getElementById("powerNew").value);
  let L = parseFloat(document.getElementById("lengthNew").value);
  let material = document.getElementById("materialSection").value;
  let voltageType = document.getElementById("voltageType").value;

  if (isNaN(P) || isNaN(L)) {
    document.getElementById("sectionRes").innerHTML = "შეავსე ყველა ველი";
    return;
  }

  let U = parseFloat(voltageType);
  let I = (U == 220) ? P / U : P / (Math.sqrt(3) * U);

  let I_best = I * 1.15;
  let density = (material === "copper") ? 6 : 4;
  let S_calc = I_best / density;

  let sizes = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50];
  let S_final = sizes.find(s => s >= S_calc) || "მეტია 50mm²";

  document.getElementById("sectionRes").innerHTML =
    "ამპერი: " + I.toFixed(2) + " A<br>" + 
    "რეკომენდებული: " + I_best.toFixed(2) + " A<br><br>" +
    "მინ. კვეთა ≈ " + S_calc.toFixed(2) + " mm²<br>" +
    "არჩეული: <b>" + S_final + " mm²</b>";
}

function calcDrop() {
  let L = Number(document.getElementById("length").value); // სიგრძე მეტრებში
  let S = Number(document.getElementById("section").value); // კვეთა mm²
  let I = Number(document.getElementById("current").value); // ამპერი
  let U = Number(document.getElementById("voltage").value); // ძაბვა
  let rho = Number(document.getElementById("materialDrop").value); // ρ სპილენძი ან ალუმინი

  if (!L || !S || !I || !U) {
    document.getElementById("dropRes").innerHTML = "გთხოვ შეავსე ყველა ველი";
    return;
  }

  // წინააღმდეგობა
  let R = (rho * (2 * L)) / S;

  // ძაბვის ვარდნა ვოლტებში
  let dU = I * R;

  // ძაბვის ვარდნა პროცენტში
  let dU_percent = (dU / U) * 100;

  // სტატუსი ფერის მიხედვით
  let status = "";
  if (dU_percent <= 3) {
    status = "✅ უსაფრთხო (მწვანე)";
  } else if (dU_percent <= 5) {
    status = "⚠ ყურადღება (ყვითელი)";
  } else {
    status = "❌ არასასურველი (წითელი)";
  }

  // დაკარგული სიმძლავრე
  let P_loss = I * I * R;

  document.getElementById("dropRes").innerHTML =
    `ძაბვის ვარდნა: <b>${dU.toFixed(2)} V</b> (${dU_percent.toFixed(2)}%)<br>` +
    `სტატუსი: <b>${status}</b><br>` +
    `დატვირთვის ძაბვა: ${ (U - dU).toFixed(2) } V<br>` +
    `კალორიული დაკარგვა: ${P_loss.toFixed(2)} W`;
}

function generateTable() {
  let P = Number(document.getElementById("powerTable").value);
  let U = Number(document.getElementById("phaseTable").value);
  let material = document.getElementById("materialTable").value;
  let dropPercent = Number(document.getElementById("dropPercent").value);

  if (!P) {
    document.getElementById("tableResult").innerHTML = "შეავსე სიმძლავრე";
    return;
  }

  let rho = material === "copper" ? 0.0175 : 0.028; // სპილენძი ან ალუმინი
  let I = U == 220 ? P / U : P / (Math.sqrt(3) * U);

  const sizes = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95];
  let tableHTML = `<table border="1" style="width:100%; border-collapse: collapse;">
    <tr>
      <th>კვეთა (mm²)</th>
      <th>მაქს. სიგრძე (მ)</th>
      <th>შეფასება</th>
      <th>რეკომენდებული ავტომატი</th>
    </tr>`;

  sizes.forEach(S => {
    let L = (dropPercent/100 * U * S) / (2 * rho * I);
    let evaluation = "";
    let breaker = "";

    if (I <= S * 6) { // ოპტიმალური (მწვანე)
      evaluation = "✅ ოპტიმალური";
      if (I <= 10) breaker = "B10";
      else if (I <= 16) breaker = "C16";
      else if (I <= 25) breaker = "C25";
      else if (I <= 32) breaker = "C32";
      else if (I <= 40) breaker = "C40";
      else breaker = "C50+";
    } else if (I <= S * 8) { // ნაშუამავალი (ყვითელი)
      evaluation = "⚠ შესაძლოა დიდხანს";
      breaker = "-";
    } else { // არასასურველი (წითელი)
      evaluation = "❌ არასასურველი";
      breaker = "-";
    }

    tableHTML += `
      <tr>
        <td>${S}</td>
        <td>${L.toFixed(1)} მ</td>
        <td>${evaluation}</td>
        <td>${breaker}</td>
      </tr>
    `;
  });

  tableHTML += "</table>";

  document.getElementById("tableResult").innerHTML =
    `<b>ამპერი: ${I.toFixed(2)} A</b><br><br>` + tableHTML;
}
