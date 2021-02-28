import React from 'react';
import Table from 'ecp/table';
import {H3} from 'ecp/page';
import Button from 'ecp/button'
import W from 'ecp/divwin';
import net from 'ecp/net';
import Grid from 'ecp/grid';
import tp_utils from './tp_utils.js'

const columns = [
{
	title: '名称',
	key: 'name',
}, {
	title: '说明',
	key: 'memo',
}, {
	title: '图片',
	key: 'id',
	tp: (v,r)=><img class="tp-img" alt="tp-img" src={`/utils/thumb?id=${v}`}/>
}];

function Tpinfo(props) {
  const {tpinfo}=props
  return (
	<Grid.Row>
		<Grid.Col width="40%" >
			<img  class="tp-img-big" alt="tp-img-big" src={`/utils/thumb?id=${tpinfo.id}`}/>
		</Grid.Col>
		<Grid.Col width="50%" >
			<p><span>名称:</span>{tpinfo.name} </p>
			<p><span>说明:</span>{tpinfo.memo} </p>
			<p><span>尺寸:</span>{tpinfo.width/10}厘米 X {tpinfo.height/10}厘米 </p>
			<br/>
			<p>模板变量</p>
			{props.tp_vars.map((o,i)=><p key={i}>{o}</p>)}
		</Grid.Col>
	</Grid.Row>)
}

class Seltp extends React.Component {

    /* 状态 */
    state={
    	search_key : ""
    }
    
    componentDidMount=()=>{
    	this.props.setStep("seltp")
    	if (this.props.tpid) this.loadtp(this.props.tpid);
    }
    
    loadtp=async(tpid)=>{
    	let rc=await net.get(`/api/load-template?id=${tpid}`);
    	let tp_vars=tp_utils.get_vars(rc.data);
    	this.props.onChangeTp({tpid, tpinfo:rc.tpinfo, tp_vars});
    }
    
    nextStep=()=>{
			const {tpdata}=this.props;
    	const {tpinfo, tp_vars}=tpdata;
    	if (!tpinfo) {
    		W.alert("请先选择打印模版");
    		return;
    	}
    	if (!tp_vars || tp_vars.length===0) {
    		W.confirm("模版没有需要绑定的变量!\n仍然要打印吗？", 
    			()=>this.props.history.push("/print-tools/doprint")
    		)
    	}else{
	    	this.props.history.push("/print-tools/loaddata");
	    }
    }
    
    seltp=async (record)=>{
    	let tpid=record.id;
    	this.setState({tpid, tpinfo:record});
    	let rc=await net.get(`/api/load-template?id=${tpid}`);
    	let tp_vars=tp_utils.get_vars(rc.data);
    	this.props.onChangeTp({tpid, tpinfo:rc.tpinfo, tp_vars});
    }
    
    dosearch=(search_key)=>{
    	this.setState({search_key})
    }
    
    actions=(tabObj, record)=>{
        return(
            <span>
                <Button type='inline' onClick={()=>this.seltp(record)}>选择</Button>
            </span>
        )
    }
    
    render() { 
    	const {search_key}=this.state;
    	const {tpdata}=this.props;
    	const {tpinfo, tp_vars}=tpdata;
    	return (
    	   <>
					<Grid.Row>
    	   		<Grid.Col width='50%' class="tp-list">
    	   			<H3>可用标签模版列表</H3>
    	   			<Table dataUrl={`/api/get-tp-list?key=${search_key}`} 
    	   					columns={columns} actions={this.actions} pg_size={4} />
    	   		</Grid.Col>
    	   		<Grid.Col width='50%' class="tp-info" >
    	   			<div >
 	   	   			<H3>已选模版</H3>
    	   				{tpinfo ? <Tpinfo tpinfo={tpinfo} tp_vars={tp_vars} /> : "请选择标签模版" }
    	   			</div>
    	   		</Grid.Col>	
    	   	</Grid.Row>
    	   	<hr/>
    	   	<div style={{float:"right"}}>
    	   		<Button onClick={this.nextStep}>下一步</Button>
    	   	</div>
	   </>
    	);
    }
    
}

export default Seltp
