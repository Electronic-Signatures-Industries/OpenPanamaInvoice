<template>
  <v-container>
    <v-progress-linear
      indeterminate
      v-if="loading"
      color="teal"
    ></v-progress-linear>

    <v-alert type="warning" dense dismissible>OpenPanamaInvoice - Beta</v-alert>
    <v-row
      ><v-col cols="6"  md="6">
        <v-expansion-panels multiple v-model="panels">
          <v-expansion-panel>
            <v-expansion-panel-header v-slot="{ open }">
              <v-row v-show="!open" no-gutters>
                <v-col cols="4">Generales</v-col>
                <v-col cols="4" class="text--secondary"> # {{ id }} </v-col>
                <v-col cols="2" class="text--secondary">
                  de {{ emisor }}
                </v-col>

                <v-col cols="2" class="text--secondary">
                  para {{ receptor }}
                </v-col>
              </v-row>
              <v-row v-show="open" no-gutters>
                <v-col cols="4">Generales</v-col>
                <v-col cols="8" class="text--secondary"> </v-col>
              </v-row>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <fe-generales
                :template="template"
                @input="handleUpdate"
                v-model="model.gDGen"
              ></fe-generales>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel >
            <v-expansion-panel-header v-slot="{ open }">
              <v-row v-show="!open" no-gutters>
                <v-col cols="4">Articulos</v-col>
                <v-col cols="6" class="text--secondary">
                  {{ model.gItem.length }} articulos
                </v-col>
                <v-col cols="2" class="text--secondary">
                  B./ {{ totalItems }}
                </v-col>
              </v-row>
              <v-row v-show="open" no-gutters>
                <v-col cols="4">Articulos</v-col>
                <v-col cols="8" class="text--secondary"> </v-col>
              </v-row>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <fe-item
                :template="template"
                v-bind:itemindex.sync="model.gItem"
              ></fe-item>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-header v-slot="{ open }">
              <v-row v-show="!open" no-gutters>
                <v-col cols="4">Totales</v-col>
                <v-col cols="6" class="text--secondary"> </v-col>
                <v-col cols="2" class="text--secondary">
                  B./ {{ totales }}
                </v-col>
              </v-row>
              <v-row v-show="open" no-gutters>
                <v-col cols="4">Totales</v-col>
                <v-col cols="8" class="text--secondary"> </v-col>
              </v-row>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <fe-total
                :template="template"
                v-bind:totales.sync="model.gTot"
              ></fe-total>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
      <v-col cols="6"  md="6">
        <v-row>
          <!-- <v-col>
        <v-btn class="primary">Guardar como plantilla</v-btn>
      </v-col>

      <v-col>
        <v-btn class="primary">Guardar en almacenamiento seguro</v-btn>
      </v-col> -->

          <v-col>
            <codemirror v-model="xml" :options="cmOptions"></codemirror>
          </v-col>
        </v-row>
        <v-row>
          <!-- <v-col>
        <v-btn class="primary">Guardar como plantilla</v-btn>
      </v-col>

      <v-col>
        <v-btn class="primary">Guardar en almacenamiento seguro</v-btn>
      </v-col> -->

          <v-col>
            <codemirror v-model="xml2" :options="cmOptions"></codemirror>
          </v-col>
        </v-row>
        <v-row>
          <!-- <v-col>
        <v-btn class="primary">Guardar como plantilla</v-btn>
      </v-col>

      <v-col>
        <v-btn class="primary">Guardar en almacenamiento seguro</v-btn>
      </v-col> -->

          <v-col>
            <v-btn class="primary" @click="sign">Firmar</v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>
<script lang="ts">
import {
  TypedRFE,
  Totales,
  DGen,
  Emisor,
  Receptor,
  CatBienes,
  DescBienes,
  FormaPago,
  Item,
  Paises,
  Plantillas,
  TasaITBMS,
  TiempoPago,
  TipoNaturalezaOperacion,
  TipoOperacion,
  TipoReceptor,
  TipoRuc,
  TipoTransaccionVenta,
  Ubicaciones,
  Unidades,
  FEBuilder,
  TipoAmbiente,
  TipoDocumento,
  CUFE,
  TipoEmision,
  CUFEBuilder,
  XmlDsig,
  X509,
  Destino,
  EntregaCafe,
  EnvioContenedorFE,
  FormularioCafe,
  TipoGeneracion,
} from "ifesa-dgi-factura-electronica";
import { Component, Prop, Vue } from "vue-property-decorator";
import TotalIndex from "./widgets/totales/Totales.vue";
import "codemirror/theme/base16-dark.css";
import Countries from "./widgets/Countries.vue";
import ItemIndex from "./widgets/lineitem/Item.vue";
import GeneralesIndex from "./widgets/generales/Generales.vue";
const rs = require("jsrsasign");

@Component({
  components: {
    "fe-total": TotalIndex,
    "fe-item": ItemIndex,
    "fe-generales": GeneralesIndex,
  },
})
export default class TemplateEditor extends Vue {
  cmOptions = {
    // codemirror options
    tabSize: 4,
    mode: "text/xml",
    theme: "base16-dark",
    lineNumbers: true,
    line: true,
    lineWrapping: true,
    foldGutter: true,
    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
  };
  model: TypedRFE = new TypedRFE();
  panels = [0,1,]
  openItems = false;
  open = false;
  xml: any = "";
  xml2: any = "";
  get totalItems() {
    const n = this.model.gItem.reduce((prev, c) => {
      const p = (c.gPrecios || {}) as any;
      const amt = p.dValTotItem || 0;
      return amt + 0;
    }, 0);
    return n.toFixed(2);
  }
  get totales() {
    const t = this.model.gTot.dVTot || 0;
    return t.toFixed(2);
  }
  get emisor() {
    const em = this.model.gDGen.gEmis;
    return (em || {}).dNombEm || "Pendiente";
  }
  get receptor() {
    const receptor = this.model.gDGen.gDatRec;
    return (receptor || {}).dNombRec || "Pendiente";
  }
  get id() {
    return this.model.dId || "Pendiente";
  }

  loading = false;
  template = {
    gRetenc: {
      visible: false,
    },
    gPagPlazo: {
      visible: false,
    },
    dTotAcar: {
      visible: false,
    },
    dNroItems: {
      default: 1,
      visible: true,
    },
    dSecItem: {
      default: 1,
      visible: true,
    },
    iPzPag: {
      visible: true,
    },
  };
  handleUpdate(item) {
    //   this.model = { ...item };
  }

  async mounted() {
    // Invoice info
    const gDGen = {
      iAmb: TipoAmbiente.Pruebas,
      dFechaEm: new Date(2020, 9, 9),
      dFechaSalida: new Date(2021, 12, 9),
      iFormCafe: FormularioCafe.PapelFormatoCarta,
      iEntCafe: EntregaCafe.EnviadoReceptorElectronicamente,
      iProGen: TipoGeneracion.SistemaFacturacionContribuyente,
      iDest: Destino.Panama,
      iTpEmis: TipoEmision.UsoPrevioOpsNormal,
      iDoc: TipoDocumento.FacturaOpsInterna,
      dEnvFe: EnvioContenedorFE.Normal,

      dNroDF: "2598274063",
      dPtoFacDF: "930",
      dSeg: "672958054",
      iNatOp: TipoNaturalezaOperacion.Venta,
      iTipoOp: TipoOperacion.Compra,
      iTipoTranVenta: TipoTransaccionVenta.Giro,
      // Issuer/
      gEmis: {
        gRucEmi: {
          dTipoRuc: TipoRuc.Juridico,
          dRuc: "29-29-29",
          dDV: "56",
        },
        dNombEm: "",
        dSucEm: "7632",
        dCoordEm: "+8.9892,-79.5201",
        gUbiEm: {
          dCodUbi: Ubicaciones["BOCAS DEL TORO-BOCAS DEL TORO-BASTIMENTOS"],
        },
        dDirecEm: "Calle 50",
        dTfnEm: ["66731138"],
      },
      // Receiver
      gDatRec: {
        iTipoRec: TipoReceptor.Contribuyente,
        gRucRec: {
          dTipoRuc: TipoRuc.Juridico,
          dRuc: "29-29-29",
          dDV: "56",
        },
        cPaisRec: Paises.PANAMA,
        dNombRec: "",
        gUbiRec: {
          dCodUbi: Ubicaciones["PANAMA OESTE-ARRAIJAN-CERRO SILVESTRE"],
        },
        dDirecRec: "Calle 50",
        dTfnRec: ["66731138"],
      },
      gAutXML: [
        {
          gRucAutXML: {
            dTipoRuc: TipoRuc.Juridico,
            dRuc: "29-29-29",
            dDV: "56",
          },
        },
      ],
    };

    // Items
    const gItem: Item[] = [
      {
        dSecItem: 1,
        dDescProd:
          "Servicios profesionales Abril Mayo 2020 relacionado a desarrollo web",
        cCantCodInt: 1,
        cUnidad: Unidades["Actividad: una unidad de trabajo o acción"],
        dInfEmFE: "No reembolsable",
        gPrecios: {
          dPrItem: 500,
          dPrUnit: 500,
          dValTotItem: 500,
        },
        gITBMSItem: {
          dTasaITBMS: TasaITBMS.TasaExonerado,
          dValITBMS: 0,
        },
      },
      {
        dSecItem: 2,
        dDescProd:
          "Investigacion de algoritmo para firmar una factura electronica",
        cCantCodInt: 1,
        dCodCPBSabr:
          CatBienes[
            "Servicios de Gestión, Servicios Profesionales de Empresa y Servicios Administrativos"
          ],
        dCodCPBScmp: DescBienes.Software,
        dInfEmFE: "Probablemente posible",
        gPrecios: {
          dPrItem: 500,
          dPrUnit: 500,
          dValTotItem: 500,
        },
        gITBMSItem: {
          dTasaITBMS: TasaITBMS.TasaExonerado,
          dValITBMS: 0,
        },
      },
    ];

    // Totals
    const gTot: Totales = {
      dNroItems: 1,
      dTotGravado: 1000,
      dTotITBMS: 0,
      dTotNeto: 1000,
      dTotRec: 0,
      dVTot: 1000,
      dVTotItems: 1,
      dVuelto: 0,
      iPzPag: TiempoPago.Plazo,
      gFormaPago: [
        {
          iFormaPago: FormaPago.Otro,
          dVlrCuota: 1,
        },
      ],
    };

    const cufe = new CUFE();
    cufe.iAmb = gDGen.iAmb;
    cufe.dFechaEm = gDGen.dFechaEm;
    cufe.iTpEmis = gDGen.iTpEmis.replace("0", "");
    const gRucEmi = gDGen.gEmis.gRucEmi;

    cufe.iDoc = gDGen.iDoc.replace("0", "");
    cufe.dDV = parseInt(gDGen.gEmis.gRucEmi.dDV, 10);
    cufe.dSucEm = gDGen.gEmis.dSucEm;
    cufe.dRUC = gRucEmi;
    cufe.dTipoRuc = gRucEmi.dTipoRuc;
    cufe.dPtoFacDF = gDGen.dPtoFacDF;
    cufe.dNroDF = gDGen.dNroDF;
    cufe.dSeg = gDGen.dSeg;
    const cufeBuilder = new CUFEBuilder(cufe);
    const res = cufeBuilder.create(gDGen.dSeg);
    this.model = {
      // CUFE, hardcoded
      dId: "FE01200000000000029-29-29-5676322018101525982740639300126729580548",
      // dId: `FE${res.cufe}${res.dv}`,
      dVerForm: 1.0,
      gDGen,
      gItem,
      gTot,
    };

    // gen
    this.xml = await FEBuilder.create().rFE(this.model).toXml();
  }

  async sign() {
    // const ipfsManager = new IPLDManager(didRSA.did)
    // await ipfsManager.start(`http://ifesa.ipfs.pa:5001`)

    // const alice = Buffer.from('Hola Alice!')
    // const links = []
    // // Alice
    // let cid = await ipfsManager.addSignedObject(alice, {
    //   name: 'alice.txt',
    //   contentType: 'text/html',
    //   lastModified: new Date(),
    // })
    // links.push(cid)
    // const bob = Buffer.from('Hola IPFS World!')
    // // Bob
    // let cid2 = await ipfsManager.addSignedObject(bob, {
    //   name: 'bob.txt',
    //   contentType: 'text/html',
    //   lastModified: new Date(),
    // })

    const issuer = {
      stateOrProvinceName: "PA",
      organizationName: "RM",
      organizationalUnitName: "Engineering",
      commonName: "Rogelio Morrell",
      countryName: "Panama",
      localityName: "Panama",
    };
    const key = rs.KEYUTIL.generateKeypair("RSA", 2048);

    try {
      const cert = X509.createSelfSignedCertificateFromRSA(
        rs.KEYUTIL.getPEM(key.prvKeyObj, "PKCS8PRV"),
        rs.KEYUTIL.getPEM(key.pubKeyObj, "PKCS8PUB"),
        issuer
      );

      const signedDocuments = await XmlDsig.signFEDocument(
        rs.KEYUTIL.getPEM(key.prvKeyObj, "PKCS8PRV"),
        cert,
        this.xml
      );

      this.xml2 = signedDocuments.xml;
    } catch (e) {
      console.log(e);
    }
  }
}
</script>
