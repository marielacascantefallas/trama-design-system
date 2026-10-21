import json,re
C=lambda v:{"$type":"color","$value":v}
D=lambda v,t="dimension":{"$type":t,"$value":v}
anil={50:'#EEF0FF',100:'#E0E3FF',200:'#C4C9FE',300:'#A0A6FB',400:'#7C82F6',500:'#5B5FEE',600:'#4643DB',700:'#3833B8',800:'#2E2B91',900:'#232264'}
atar={50:'#FFF4ED',100:'#FFE5D3',200:'#FEC7A5',300:'#FCA06D',400:'#F97A3E',500:'#EA5A1A',600:'#C94512',700:'#A23612',800:'#812D15',900:'#5F2213'}
pied={0:'#FFFFFF',50:'#F7F7F5',100:'#EEEEEB',200:'#DEDDD8',300:'#C3C1BA',400:'#9A978F',500:'#75726A',600:'#57554F',700:'#3F3D39',800:'#292826',900:'#1A1918',950:'#111110'}
verde={50:'#ECFDF3',300:'#86EFAC',600:'#15803D',900:'#0B2A18'}
rojo={50:'#FEF2F2',300:'#FCA5A5',600:'#C62828',900:'#3A1212'}
ambar={50:'#FFF7E6',300:'#FCD34D',600:'#B45309',900:'#2E1F05'}
prim={"color":{n:{str(k):C(v) for k,v in r.items()} for n,r in [("anil",anil),("atardecer",atar),("piedra",pied),("verde",verde),("ambar",ambar),("rojo",rojo)]},
 "space":{str(k):D(f"{k}px") for k in [0,4,8,12,16,20,24,32,40,48,64]},
 "radius":{"4":D("4px"),"6":D("6px"),"8":D("8px"),"10":D("10px"),"14":D("14px"),"full":D("999px")},
 "size":{"24":D("24px"),"32":D("32px"),"40":D("40px"),"48":D("48px")},
 "borderWidth":{"1":D("1px"),"2":D("2px")},
 "duration":{"0":D("0ms","duration"),"120":D("120ms","duration"),"200":D("200ms","duration"),"320":D("320ms","duration")},
 "fontFamily":{"sans":{"$type":"fontFamily","$value":"Instrument Sans"}},
 "fontSize":{str(k):D(f"{k}px") for k in [12,14,16,18,20,24,28,32]},
 "fontWeight":{"regular":{"$type":"fontWeight","$value":400},"medium":{"$type":"fontWeight","$value":500},"semibold":{"$type":"fontWeight","$value":600}}}
def brand(ramp,r1,r2):
  return {"brand":{s:C("{color.%s.%s}"%(ramp,s)) for s in ["50","100","200","300","400","500","600","700","800","900"]},
          "radius":{"control":D("{radius.%s}"%r1),"card":D("{radius.%s}"%r2)}}
def sem(m):
  L=m=="light"
  r=lambda a,b:a if L else b
  return {"color":{
   "bg":{"canvas":C(r("{color.piedra.50}","{color.piedra.950}")),"surface":C(r("{color.piedra.0}","{color.piedra.900}")),"subtle":C(r("{color.piedra.100}","{color.piedra.800}")),"disabled":C(r("{color.piedra.100}","{color.piedra.800}"))},
   "text":{"primary":C(r("{color.piedra.900}","{color.piedra.50}")),"brand":C(r("{brand.700}","{brand.300}")),"disabled":C(r("{color.piedra.400}","{color.piedra.500}")),"secondary":C(r("{color.piedra.600}","{color.piedra.300}")),"placeholder":C(r("{color.piedra.600}","{color.piedra.300}"))},
   "border":{"default":C(r("{color.piedra.200}","{color.piedra.700}")),"control":C(r("{color.piedra.500}","{color.piedra.400}"))},
   "action":{"primary":C(r("{brand.600}","{brand.400}")),"primary-hover":C(r("{brand.700}","{brand.300}")),"on-primary":C(r("{color.piedra.0}","{color.piedra.950}")),"subtle":C(r("{brand.50}","{brand.900}")),"on-subtle":C(r("{brand.700}","{brand.200}"))},
   "focus":{"ring":C(r("{brand.600}","{brand.300}"))},
   "overlay":{"scrim":C(r("#12121F73","#00000099"))},
   "status":{"success":C(r("{color.verde.600}","{color.verde.300}")),"success-bg":C(r("{color.verde.50}","{color.verde.900}")),"warning":C(r("{color.ambar.600}","{color.ambar.300}")),"warning-bg":C(r("{color.ambar.50}","{color.ambar.900}")),"danger":C(r("{color.rojo.600}","{color.rojo.300}")),"danger-bg":C(r("{color.rojo.50}","{color.rojo.900}"))}},
  "focus":{"width":D("{borderWidth.2}"),"offset":D("{borderWidth.2}")},
  "size":{"target-min":D("{size.24}"),"control-sm":D("{size.32}"),"control-md":D("{size.40}"),"control-lg":D("{size.48}")},
  "motion":{"fast":D("{duration.120}","duration"),"base":D("{duration.200}","duration"),"slow":D("{duration.320}","duration")}}
out={"primitives":prim,"brand/hilo":brand("anil","10","14"),"brand/ruta":brand("atardecer","6","8"),"semantic/light":sem("light"),"semantic/dark":sem("dark")}
themes=[]
for b,bn in [("hilo","Hilo"),("ruta","Ruta")]:
  for m,mn in [("light","claro"),("dark","oscuro")]:
    themes.append({"id":f"{b}-{m}","name":f"{bn} {mn}","group":"Trama","selectedTokenSets":{"primitives":"source",f"brand/{b}":"enabled",f"semantic/{m}":"enabled"}})
out["$themes"]=themes
out["$metadata"]={"tokenSetOrder":["primitives","brand/hilo","brand/ruta","semantic/light","semantic/dark"]}
json.dump(out,open("tokens/trama-tokens.json","w"),indent=2,ensure_ascii=False)
# validate: resolve every theme
def flat(d,p="",acc=None):
  acc={} if acc is None else acc
  for k,v in d.items():
    if isinstance(v,dict) and "$value" in v: acc[p+k]=v["$value"]
    elif isinstance(v,dict): flat(v,p+k+".",acc)
  return acc
def L(h):
  c=[int(h[i:i+2],16)/255 for i in (1,3,5)];c=[x/12.92 if x<=0.03928 else ((x+0.055)/1.055)**2.4 for x in c];return .2126*c[0]+.7152*c[1]+.0722*c[2]
cr=lambda a,b:(max(L(a),L(b))+.05)/(min(L(a),L(b))+.05)
for t in themes:
  tok={}
  for s in t["selectedTokenSets"]: tok.update(flat(out[s]))
  def res(v,d=0):
    m=re.fullmatch(r"\{(.+)\}",str(v))
    if not m: return v
    assert m.group(1) in tok,(t["id"],v); return res(tok[m.group(1)],d+1)
  R={k:res(v) for k,v in tok.items()}
  g=lambda k:R["color."+k]
  checks=[("text.primary","bg.surface",4.5),("text.secondary","bg.canvas",4.5),("text.placeholder","bg.surface",4.5),("action.on-primary","action.primary",4.5),("action.on-subtle","action.subtle",4.5),("status.success","status.success-bg",4.5),("status.warning","status.warning-bg",4.5),("border.control","bg.canvas",3),("focus.ring","bg.canvas",3),("text.brand","bg.surface",4.5),("text.brand","bg.canvas",4.5),("text.brand","action.subtle",4.5),("text.primary","bg.subtle",4.5),("status.danger","bg.surface",4.5),("status.danger","bg.canvas",4.5),("status.danger","status.danger-bg",4.5),("text.secondary","bg.subtle",4.5)]
  worst=min((cr(g(a),g(b)),a) for a,b,_ in checks)
  fails=[a for a,b,m in checks if cr(g(a),g(b))<m]
  print(t["name"],"tokens:",len(R),"| fallas:",fails or "ninguna","| peor:",round(worst[0],2),worst[1])
